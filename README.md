# lab-films

Renders the Lab pieces' full-length films on GitHub Actions, so the laptop does no rendering.
Each piece's static build lives in `films/<film>/dist` (copied from its project's `dist/`);
`render.mjs` seeks the piece's `window.__demo` frame by frame and pipes screenshots to ffmpeg.

    gh workflow run render.yml -f film=solar                 # the whole film
    gh workflow run render.yml -f film=solar -f limit=120     # a test: first 120 frames
    gh run download <run-id> -n solar-film                   # fetch the result

To update a piece: rebuild it in its project, copy its `dist/` over `films/<film>/dist`, commit, push.
