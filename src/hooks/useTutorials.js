import { useState, useEffect, useCallback } from "react";

const TUTORIAL_STORAGE_PREFIX = "wba_tutorials_";
const TUTORIAL_CHANGE_EVENT = "wba_tutorials_changed";

function getStorageKey(userEmail) {
  return `${TUTORIAL_STORAGE_PREFIX}${userEmail || "guest"}`;
}

function loadTutorialState(userEmail) {
  try {
    const raw = localStorage.getItem(getStorageKey(userEmail));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading tutorial state:", e);
  }
  return {
    screens: {},
    tooltips: {},
  };
}

function saveTutorialState(userEmail, state) {
  try {
    localStorage.setItem(getStorageKey(userEmail), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(TUTORIAL_CHANGE_EVENT, { detail: { userEmail } }));
  } catch (e) {
    console.error("Error saving tutorial state:", e);
  }
}

export function useTutorials(userEmail = null) {
  const [state, setState] = useState(() => loadTutorialState(userEmail));

  // Sync state when userEmail changes or when other components update tutorials
  useEffect(() => {
    setState(loadTutorialState(userEmail));

    const handleUpdate = () => {
      setState(loadTutorialState(userEmail));
    };

    window.addEventListener(TUTORIAL_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(TUTORIAL_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [userEmail]);

  // Sprawdza czy dany dymek był już zobaczony/zamknięty
  const isTooltipSeen = useCallback((tooltipId) => {
    return Boolean(state.tooltips?.[tooltipId]);
  }, [state.tooltips]);

  // Oznacza dymek jako zobaczony/zamknięty
  const markTooltipSeen = useCallback((tooltipId) => {
    setState((prevState) => {
      const newState = {
        ...prevState,
        tooltips: {
          ...prevState.tooltips,
          [tooltipId]: true,
        },
      };
      saveTutorialState(userEmail, newState);
      return newState;
    });
  }, [userEmail]);

  // Sprawdza, czy to pierwsza wizyta na danym ekranie
  const isFirstScreenVisit = useCallback((screenName) => {
    return !state.screens?.[screenName];
  }, [state.screens]);

  // Oznacza ekran jako odwiedzony
  const markScreenVisited = useCallback((screenName) => {
    setState((prevState) => {
      const newState = {
        ...prevState,
        screens: {
          ...prevState.screens,
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

  // Resetuje samouczki dla danego ekranu
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
    saveTutorialState(userEmail, emptyState);
    setState(emptyState);
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
  };
}
