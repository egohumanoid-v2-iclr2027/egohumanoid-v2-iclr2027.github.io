# EgoHumanoid-V2 rebuttal evidence

Anonymous ICLR 2027 supplementary website. Open `index.html` through a static HTTP server; no frontend build is required. The root page provides reviewer-question anchors, revised result tables, force-sensitivity comparisons and visual-input comparisons.

```bash
python3 -m http.server 8879
```

`app.js` contains the question-to-evidence map and interactive table/video controls. `assets/rebuttal/data/` contains the result data; `assets/rebuttal/videos/` contains 84 resistance clips and 20 visual-condition clips. Existing real-robot videos are reused from `assets/videos/`.

To refresh source assets, install PyMuPDF and FFmpeg, then run:

```bash
python3 scripts/prepare_rebuttal.py --paper PAPER_DIRECTORY --resistance RESISTANCE_DIRECTORY --vision VISUAL_EXPERIMENT_DIRECTORY --pdf REVISED_PDF
```

The preparation script preserves motion and policy-input images while masking internal error overlays in the visual-input diagnostic. It does not regenerate or resimulate trajectories. The website presents these clips qualitatively and distinguishes recorded visual input from online robot-camera feedback.

Publishing uses the existing anonymous project account and GitHub Pages branch. Preserve the project commit identity and the local pre-push account check. Do not publish raw checkpoints, logs, source experiment paths or personal credentials.
