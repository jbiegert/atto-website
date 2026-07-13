# Attoscience and Ultrafast Optics — group website

Static site. No database, no plugins, nothing to patch.
**To change content, edit the files in `data/`. Never edit `index.html` or `js/site.js`.**

## Folder map

```
index.html        the page structure — do not edit
css/style.css     the design — do not edit
js/site.js        renders the page from data/ — do not edit
img/              photos, figures, logos
img/people/       headshots (see below)
data/*.json       ← YOUR CONTENT LIVES HERE
```

## Common edits

### Add a group member
Open `data/people.json`, copy an existing block, change the values:

```json
{
  "name": "Jane Doe",
  "role": "PhD Student",
  "degree": "MSc Physics, TU Munich (DE)",
  "email": "jane.doe@icfo.eu",
  "photo": "img/people/jane-doe.jpg"
}
```
Drop `jane-doe.jpg` into `img/people/`. Square image, ~600×600 px.
If there is no photo yet, the tile falls back to a pattern — the page still looks right.

Valid `role` values (these control grouping):
`Research Fellow`, `Staff Researcher`, `Postdoctoral Researcher`,
`PhD Student`, `Student`, `Visiting Scientist`

### Someone leaves
Cut their block from `people.json`. Add their name to `former.json`:
`["Jane Doe", "Postdoctoral Researcher"]`
If they finished a PhD, add them to `alumni.json` instead:
`["2027", "Jane Doe", "Postdoc, MIT", "Thesis title here"]`

### Alumni leaders (`data/leaders.json`)
Three fields:
- `professorCount` — the big number shown ("N alumni now hold professorships"). Edit this by hand when it changes.
- `academia` — names shown in the "In academia" column: full professors **and** group leaders. This list can be longer than `professorCount` (e.g. a group leader who isn't a professor sits here without changing the number).
- `industry` — names shown in the "Leading in industry" column.

To add a new professor: add them to `academia` **and** increase `professorCount` by one.
To add a group/research leader who is not a professor: add them to `academia` only, leave `professorCount` unchanged.

### Add an achievement to the timeline
`data/achievements.json`:
```json
{"year":"2027","venue":"Nature 999, 1","title":"Short title","text":"One or two sentences."}
```

### Add a paper highlight ("Selected contributions")
`data/contributions.json`. `capability` must match a `key` in `capabilities.json`
(`ultrafast`, `extreme`, `microscopy`, `softxray`):
```json
{
  "capability": "softxray",
  "title": "Isolated attosecond soft X-ray pulse",
  "text": "Two or three sentences describing the result.",
  "image": "img/contrib/isolated-pulse.jpg",
  "citations": ["Author, A. et al. Nat. Commun. 6, 6611 (2015)."]
}
```
`image` and `citations` are optional. Put figures in `img/contrib/`.

### Change the headline, email, or Scholar link
`data/site.json`.

## Rules that keep it working
- JSON is strict: every `"key": "value"` needs quotes, commas between items, **no trailing comma**.
- Paste your file into https://jsonlint.com before uploading if unsure.
- Keep images under ~300 KB. Resize before uploading.
- If the page shows a red error bar, a JSON file has a syntax error. The bar names the file.

## Local preview
```
python3 -m http.server 8000
```
then open http://localhost:8000
(Opening `index.html` directly by double-click will not work — the browser blocks
`fetch()` on `file://`. It must be served.)
