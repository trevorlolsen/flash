// State machine: hidden → revealed → rated. Mirrors standardReviewState.
// `activeGroup` identifies which cloze group is being tested in this entry.
const clozeReviewState = {
  create(card, activeGroup) {
    return {
      card,
      activeGroup,
      phase: "hidden",
      startedAt: Date.now(),
      revealedAt: null,
      rating: null
    };
  },

  reveal(state) {
    if (state.phase !== "hidden") return state;
    return { ...state, phase: "revealed", revealedAt: Date.now() };
  },

  rate(state, rating) {
    return { ...state, phase: "rated", rating };
  }
};
