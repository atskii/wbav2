import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

const TUTORIAL_CHANGE_EVENT = "wba_tutorials_changed";

function getStorageKey(userEmail) {
  return `wba_tutorials_${userEmail || "anonymous"}`;
}

function getLocalTutorials(userEmail) {
  if (!userEmail) return { screens: {}, tooltips: {} };
  try {
    const raw = localStorage.getItem(getStorageKey(userEmail));
    if (!raw) return { screens: {}, tooltips: {} };
    const parsed = JSON.parse(raw);
    return {
      screens: parsed?.screens || {},
      tooltips: parsed?.tooltips || {},
    };
  } catch {
    return { screens: {}, tooltips: {} };
  }
}

function setLocalTutorials(userEmail, state) {
  if (!userEmail) return;
  try {
    localStorage.setItem(getStorageKey(userEmail), JSON.stringify(state));
  } catch (e) {
    console.error("Error writing tutorials to localStorage:", e);
  }
}

function mergeTutorialStates(a, b) {
  return {
    screens: { ...(a?.screens || {}), ...(b?.screens || {}) },
    tooltips: { ...(a?.tooltips || {}), ...(b?.tooltips || {}) },
  };
}

async function syncToSupabase(userEmail, state) {
  if (!userEmail) return;
  const safeState = {
    screens: state?.screens || {},
    tooltips: state?.tooltips || {},
  };

  try {
    const { error } = await supabase
      .from("tutorials")
      .upsert(
        { user_email: userEmail, state: safeState },
        { onConflict: "user_email" }
      );

    if (error) {
      console.warn("Could not sync tutorial state to Supabase:", error.message || error);
    }
  } catch (e) {
    console.warn("Exception syncing tutorial state to Supabase:", e);
  }
}

export function useTutorials(userEmail = null) {
  const [state, setState] = useState(() => getLocalTutorials(userEmail));
  const stateRef = useRef(state);
  const [loading, setLoading] = useState(false);
  const userEmailRef = useRef(userEmail);
  userEmailRef.current = userEmail;

  // Pobierz i scal stan z Supabase po zamontowaniu lub zmianie emaila
  useEffect(() => {
    if (!userEmail) {
      setState({ screens: {}, tooltips: {} });
      setLoading(false);
      return;
    }

    const local = getLocalTutorials(userEmail);
    stateRef.current = local;
    setState(local);

    let isMounted = true;

    async function fetchRemote() {
      try {
        const { data, error } = await supabase
          .from("tutorials")
          .select("state")
          .eq("user_email", userEmail)
          .maybeSingle();

        if (!isMounted) return;

        if (!error && data && data.state) {
          const currentLocal = getLocalTutorials(userEmail);
          const merged = mergeTutorialStates(currentLocal, data.state);
          setLocalTutorials(userEmail, merged);
          stateRef.current = merged;
          setState(merged);

          // Jeśli stan lokalny miał nowe dymki/ekrany nieobecne w Supabase, zaktualizuj bazę
          const localHasNew =
            Object.keys(currentLocal.screens).some(k => !data.state.screens?.[k]) ||
            Object.keys(currentLocal.tooltips).some(k => !data.state.tooltips?.[k]);

          if (localHasNew) {
            syncToSupabase(userEmail, merged);
          }
        }
      } catch (e) {
        console.warn("Exception fetching tutorials:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRemote();

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  // Nasłuchuj na zmiany wysyłane przez inne instancje hooka w tej samej karcie
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.userEmail === userEmail && e.detail?.newState) {
        stateRef.current = e.detail.newState;
        setState(e.detail.newState);
      }
    };

    window.addEventListener(TUTORIAL_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(TUTORIAL_CHANGE_EVENT, handleUpdate);
  }, [userEmail]);

  const applyNewState = useCallback(
    (updater) => {
      const email = userEmailRef.current;
      if (!email) return;

      const prevState = stateRef.current;
      const nextState = typeof updater === "function" ? updater(prevState) : updater;
      
      const safeNext = {
        screens: nextState?.screens || {},
        tooltips: nextState?.tooltips || {},
      };

      stateRef.current = safeNext;
      setState(safeNext);

      setLocalTutorials(email, safeNext);

      // Powiadom inne komponenty z nowym stanem bez ponownego pobierania z bazy
      window.dispatchEvent(
        new CustomEvent(TUTORIAL_CHANGE_EVENT, {
          detail: { userEmail: email, newState: safeNext },
        })
      );

      syncToSupabase(email, safeNext);
    },
    []
  );

  // Sprawdza czy dany dymek był już zobaczony/zamknięty
  const isTooltipSeen = useCallback(
    (tooltipId) => {
      return Boolean(state?.tooltips?.[tooltipId]);
    },
    [state?.tooltips]
  );

  // Oznacza dymek jako zobaczony/zamknięty
  const markTooltipSeen = useCallback(
    (tooltipId) => {
      applyNewState((prev) => ({
        screens: prev?.screens || {},
        tooltips: {
          ...(prev?.tooltips || {}),
          [tooltipId]: true,
        },
      }));
    },
    [applyNewState]
  );

  // Sprawdza, czy to pierwsza wizyta na danym ekranie
  const isFirstScreenVisit = useCallback(
    (screenName) => {
      return !state?.screens?.[screenName];
    },
    [state?.screens]
  );

  // Oznacza ekran jako odwiedzony
  const markScreenVisited = useCallback(
    (screenName) => {
      applyNewState((prev) => ({
        ...prev,
        screens: {
          ...(prev?.screens || {}),
          [screenName]: true,
        },
      }));
    },
    [applyNewState]
  );

  // Resetuje konkretny dymek (aby znowu się pojawił)
  const resetTooltip = useCallback(
    (tooltipId) => {
      applyNewState((prev) => {
        const nextTooltips = { ...(prev?.tooltips || {}) };
        delete nextTooltips[tooltipId];
        return {
          ...prev,
          tooltips: nextTooltips,
        };
      });
    },
    [applyNewState]
  );

  // Resetuje grupę dymków (np. dla danego ekranu)
  const resetTooltipGroup = useCallback(
    (tooltipIds) => {
      applyNewState((prev) => {
        const nextTooltips = { ...(prev?.tooltips || {}) };
        tooltipIds.forEach(id => {
          delete nextTooltips[id];
        });
        return {
          ...prev,
          tooltips: nextTooltips,
        };
      });
    },
    [applyNewState]
  );

  // Resetuje samouczki dla danego ekranu
  const resetScreen = useCallback(
    (screenName) => {
      applyNewState((prev) => {
        const nextScreens = { ...(prev?.screens || {}) };
        delete nextScreens[screenName];
        return {
          ...prev,
          screens: nextScreens,
        };
      });
    },
    [applyNewState]
  );

  // Przywraca wszystkie samouczki i dymki
  const resetAllTutorials = useCallback(() => {
    applyNewState({
      screens: {},
      tooltips: {},
    });
  }, [applyNewState]);

  return {
    isTooltipSeen,
    markTooltipSeen,
    isFirstScreenVisit,
    markScreenVisited,
    resetTooltip,
    resetTooltipGroup,
    resetScreen,
    resetAllTutorials,
    tutorialState: state,
    loading,
  };
}
