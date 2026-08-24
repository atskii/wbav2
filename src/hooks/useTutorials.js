import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const TUTORIAL_CHANGE_EVENT = "wba_tutorials_changed";

async function saveTutorialState(userEmail, state) {
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
      console.error("Error saving tutorial state to Supabase:", error);
    }
    
    // Zdarzenie lokalne, żeby odświeżyć inne komponenty korzystające z hooka w tym samym oknie
    window.dispatchEvent(new CustomEvent(TUTORIAL_CHANGE_EVENT, { detail: { userEmail } }));
  } catch (e) {
    console.error("Exception saving tutorial state:", e);
  }
}

export function useTutorials(userEmail = null) {
  const [state, setState] = useState({ screens: {}, tooltips: {} });
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    if (!userEmail) {
      setState({ screens: {}, tooltips: {} });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tutorials")
        .select("state")
        .eq("user_email", userEmail)
        .maybeSingle(); // Używamy maybeSingle, aby uniknąć błędów gdy nie ma wiersza

      if (error) {
        console.error("Error loading tutorials from Supabase:", error);
      } else if (data && data.state) {
        setState({
          screens: data.state.screens || {},
          tooltips: data.state.tooltips || {},
        });
      } else {
        setState({ screens: {}, tooltips: {} });
      }
    } catch (e) {
      console.error("Exception loading tutorials:", e);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Pobierz stan początkowy oraz synchronizuj po zmianie e-maila
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Nasłuchuj na zmiany wymuszone lokalnie (w innej części aplikacji)
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.userEmail === userEmail) {
        fetchState();
      }
    };

    window.addEventListener(TUTORIAL_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(TUTORIAL_CHANGE_EVENT, handleUpdate);
  }, [userEmail, fetchState]);

  // Sprawdza czy dany dymek był już zobaczony/zamknięty
  const isTooltipSeen = useCallback((tooltipId) => {
    return Boolean(state?.tooltips?.[tooltipId]);
  }, [state?.tooltips]);

  // Oznacza dymek jako zobaczony/zamknięty
  const markTooltipSeen = useCallback((tooltipId) => {
    setState((prevState) => {
      const newState = {
        screens: prevState?.screens || {},
        tooltips: {
          ...(prevState?.tooltips || {}),
          [tooltipId]: true,
        },
      };
      saveTutorialState(userEmail, newState);
      return newState;
    });
  }, [userEmail]);

  // Sprawdza, czy to pierwsza wizyta na danym ekranie
  const isFirstScreenVisit = useCallback((screenName) => {
    if (loading) return false; // Nie pokazujemy dopóki się nie załaduje, by uniknąć mignięcia
    return !state?.screens?.[screenName];
  }, [state?.screens, loading]);

  // Oznacza ekran jako odwiedzony
  const markScreenVisited = useCallback((screenName) => {
    setState((prevState) => {
      const newState = {
        ...prevState,
        screens: {
          ...(prevState?.screens || {}),
          [screenName]: true,
        },
      };
      saveTutorialState(userEmail, newState);
      return newState;
    });
  }, [userEmail]);

  // Resetuje konkretny dymek (aby znowu się pojawił)
  const resetTooltip = useCallback((tooltipId) => {
    setState((prevState) => {
      const nextTooltips = { ...prevState.tooltips };
      delete nextTooltips[tooltipId];
      const newState = {
        ...prevState,
        tooltips: nextTooltips,
      };
      saveTutorialState(userEmail, newState);
      return newState;
    });
  }, [userEmail]);

  // Resetuje samouczki dla danego ekranu (ustawia na "0" / nieodwiedzony)
  const resetScreen = useCallback((screenName) => {
    setState((prevState) => {
      const nextScreens = { ...prevState.screens };
      delete nextScreens[screenName];
      const newState = {
        ...prevState,
        screens: nextScreens,
      };
      saveTutorialState(userEmail, newState);
      return newState;
    });
  }, [userEmail]);

  // Przywraca wszystkie samouczki i dymki
  const resetAllTutorials = useCallback(() => {
    const emptyState = {
      screens: {},
      tooltips: {},
    };
    setState(emptyState);
    saveTutorialState(userEmail, emptyState);
  }, [userEmail]);

  return {
    isTooltipSeen,
    markTooltipSeen,
    isFirstScreenVisit,
    markScreenVisited,
    resetTooltip,
    resetScreen,
    resetAllTutorials,
    tutorialState: state,
    loading,
  };
}
