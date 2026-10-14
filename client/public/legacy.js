(function () {
        "use strict";

        /* ============================================================
   SHARED HELPERS
   ============================================================ */
        const NS = "http://www.w3.org/2000/svg";
        function svgEl(tag, attrs) {
          const e = document.createElementNS(NS, tag);
          for (const k in attrs) e.setAttribute(k, attrs[k]);
          return e;
        }
        function el(tag, attrs, children) {
          attrs = attrs || {};
          children = children || [];
          const e = document.createElement(tag);
          for (const k in attrs) {
            if (k === "class") e.className = attrs[k];
            else if (k === "html") e.innerHTML = attrs[k];
            else e.setAttribute(k, attrs[k]);
          }
          children.forEach((c) => {
            e.appendChild(
              typeof c === "string" ? document.createTextNode(c) : c,
            );
          });
          return e;
        }
        function $(sel, root) {
          return (root || document).querySelector(sel);
        }
        function randInt(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        function range(a, b) {
          const r = [];
          for (let k = a; k <= b; k++) r.push(k);
          return r;
        }
        function randomArray(n, max) {
          max = max || 60;
          return Array.from({ length: n }, () => randInt(3, max));
        }

        function renderCode(container, lines, activeLine) {
          container.innerHTML = "";
          const pre = el("pre", { class: "code" });
          lines.forEach((line, i) => {
            pre.appendChild(
              el(
                "div",
                { class: "code-line" + (i === activeLine ? " active" : "") },
                [line === "" ? " " : line],
              ),
            );
          });
          container.appendChild(pre);
        }
        function renderInfoGrid(container, cells) {
          container.innerHTML = "";
          cells.forEach((c) => {
            container.appendChild(
              el("div", { class: "info-cell" }, [
                el("div", { class: "k" }, [c.k]),
                el("div", { class: "v" }, [c.v]),
              ]),
            );
          });
        }

        /* generic step-player used by sorting / searching / tree traversal / graph traversal / recursion */
        function makePlayer(renderFn) {
          let steps = [];
          let idx = 0;
          let playing = false;
          let timer = null;
          let speed = 450;
          function renderCurrent() {
            if (steps[idx] !== undefined)
              renderFn(steps[idx], idx, steps.length);
          }
          function setSteps(s) {
            pause();
            steps = s;
            idx = 0;
            renderCurrent();
          }
          function stepFwd() {
            if (idx < steps.length - 1) {
              idx++;
              renderCurrent();
            } else pause();
          }
          function stepBack() {
            pause();
            if (idx > 0) {
              idx--;
              renderCurrent();
            }
          }
          function play() {
            if (playing || steps.length === 0) return;
            if (idx >= steps.length - 1) idx = 0;
            playing = true;
            timer = setInterval(() => {
              if (idx < steps.length - 1) {
                idx++;
                renderCurrent();
              } else pause();
            }, speed);
          }
          function pause() {
            playing = false;
            clearInterval(timer);
            timer = null;
          }
          function reset() {
            pause();
            idx = 0;
            renderCurrent();
          }
          function setSpeed(ms) {
            speed = ms;
            if (playing) {
              pause();
              play();
            }
          }
          function refresh() {
            renderCurrent();
          }
          return {
            setSteps,
            stepFwd,
            stepBack,
            play,
            pause,
            reset,
            setSpeed,
            refresh,
            get playing() {
              return playing;
            },
            get idx() {
              return idx;
            },
            get length() {
              return steps.length;
            },
          };
        }

        /* ============================================================
   CODE LANGUAGE SWITCHER (shared across every visualizer)
   ============================================================ */
        let currentLang = "pseudo";
        const langListeners = [];
        function onLangChange(cb) {
          langListeners.push(cb);
        }
        document.querySelectorAll("#langChips .cat-chip").forEach((chip) => {
          chip.addEventListener("click", () => {
            document
              .querySelectorAll("#langChips .cat-chip")
              .forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            currentLang = chip.dataset.lang;
            langListeners.forEach((cb) => {
              try {
                cb(currentLang);
              } catch (e) {
                console.error(e);
              }
            });
          });
        });

        /* ============================================================
   COPY-TO-CLIPBOARD HELPER (used by every code panel)
   ============================================================ */
        function wireCopyButton(btnId, getText) {
          const btn = $("#" + btnId);
          if (!btn) return;
          btn.addEventListener("click", async () => {
            const text = getText();
            try {
              await navigator.clipboard.writeText(text);
              btn.textContent = "Copied!";
              btn.classList.add("copied");
            } catch (e) {
              btn.textContent = "Select & copy manually";
            }
            setTimeout(() => {
              btn.textContent = "Copy";
              btn.classList.remove("copied");
            }, 1400);
          });
        }

        /* ============================================================
   NAVIGATION
   ============================================================ */
        document.querySelectorAll("#nav button").forEach((btn) => {
          btn.addEventListener("click", () => {
            document
              .querySelectorAll("#nav button")
              .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            document
              .querySelectorAll(".panel")
              .forEach((p) => p.classList.remove("active"));
            $('.panel[data-panel="' + btn.dataset.panel + '"]').classList.add(
              "active",
            );
          });
        });

        /* ============================================================
   SORTING
   ============================================================ */
        (function () {
          function mkStep(a, extra) {
            return Object.assign(
              {
                arr: a.slice(),
                compare: [],
                swap: [],
                sorted: [],
                pivot: null,
                line: 0,
                note: "",
              },
              extra,
            );
          }

          function bubbleSteps(input) {
            const a = input.slice(),
              n = a.length,
              steps = [];
            const done = [];
            steps.push(
              mkStep(a, {
                line: 0,
                note: "Starting bubble sort — repeatedly swap neighbours that are out of order.",
              }),
            );
            for (let i = 0; i < n - 1; i++) {
              for (let j = 0; j < n - 1 - i; j++) {
                steps.push(
                  mkStep(a, {
                    compare: [j, j + 1],
                    sorted: done.slice(),
                    line: 3,
                    note: `Compare a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}.`,
                  }),
                );
                if (a[j] > a[j + 1]) {
                  [a[j], a[j + 1]] = [a[j + 1], a[j]];
                  steps.push(
                    mkStep(a, {
                      swap: [j, j + 1],
                      sorted: done.slice(),
                      line: 4,
                      note: `Out of order — swap them.`,
                    }),
                  );
                }
              }
              done.push(n - 1 - i);
              steps.push(
                mkStep(a, {
                  sorted: done.slice(),
                  line: 1,
                  note: `Index ${n - 1 - i} is now in its final spot.`,
                }),
              );
            }
            done.push(0);
            steps.push(
              mkStep(a, {
                sorted: range(0, n - 1),
                line: 5,
                note: "Array is sorted.",
              }),
            );
            return steps;
          }
          function selectionSteps(input) {
            const a = input.slice(),
              n = a.length,
              steps = [];
            const done = [];
            steps.push(
              mkStep(a, {
                line: 0,
                note: "Starting selection sort — find the minimum, then place it.",
              }),
            );
            for (let i = 0; i < n - 1; i++) {
              let min = i;
              steps.push(
                mkStep(a, {
                  compare: [i],
                  sorted: done.slice(),
                  line: 2,
                  note: `Assume index ${i} is the minimum for now.`,
                }),
              );
              for (let j = i + 1; j < n; j++) {
                steps.push(
                  mkStep(a, {
                    compare: [min, j],
                    sorted: done.slice(),
                    line: 4,
                    note: `Is a[${j}]=${a[j]} smaller than current min a[${min}]=${a[min]}?`,
                  }),
                );
                if (a[j] < a[min]) {
                  min = j;
                  steps.push(
                    mkStep(a, {
                      compare: [min],
                      sorted: done.slice(),
                      line: 5,
                      note: `New minimum at index ${min}.`,
                    }),
                  );
                }
              }
              if (min !== i) {
                [a[i], a[min]] = [a[min], a[i]];
                steps.push(
                  mkStep(a, {
                    swap: [i, min],
                    sorted: done.slice(),
                    line: 6,
                    note: `Swap into place at index ${i}.`,
                  }),
                );
              }
              done.push(i);
              steps.push(
                mkStep(a, {
                  sorted: done.slice(),
                  line: 0,
                  note: `Index ${i} finalized.`,
                }),
              );
            }
            done.push(n - 1);
            steps.push(
              mkStep(a, {
                sorted: range(0, n - 1),
                line: 7,
                note: "Array is sorted.",
              }),
            );
            return steps;
          }
          function insertionSteps(input) {
            const a = input.slice(),
              n = a.length,
              steps = [];
            steps.push(
              mkStep(a, {
                sorted: [0],
                line: 0,
                note: "First element counts as a sorted list of one.",
              }),
            );
            for (let i = 1; i < n; i++) {
              const key = a[i];
              let j = i - 1;
              steps.push(
                mkStep(a, {
                  compare: [i],
                  sorted: range(0, i - 1),
                  line: 2,
                  note: `Pick up a[${i}]=${key} to insert.`,
                }),
              );
              while (j >= 0 && a[j] > key) {
                steps.push(
                  mkStep(a, {
                    compare: [j, j + 1],
                    sorted: range(0, i - 1),
                    line: 4,
                    note: `${a[j]} > ${key}, shift it right.`,
                  }),
                );
                a[j + 1] = a[j];
                j--;
                steps.push(
                  mkStep(a, {
                    swap: [j + 1],
                    sorted: range(0, i - 1),
                    line: 5,
                    note: `Shifted.`,
                  }),
                );
              }
              a[j + 1] = key;
              steps.push(
                mkStep(a, {
                  sorted: range(0, i),
                  line: 7,
                  note: `Placed ${key} at index ${j + 1}.`,
                }),
              );
            }
            steps.push(
              mkStep(a, {
                sorted: range(0, n - 1),
                line: 8,
                note: "Array is sorted.",
              }),
            );
            return steps;
          }
          function mergeSteps(input) {
            const a = input.slice(),
              n = a.length,
              steps = [];
            steps.push(
              mkStep(a, {
                line: 0,
                note: "Starting merge sort — split in half recursively, then merge sorted halves.",
              }),
            );
            function sort(l, r) {
              if (l >= r) return;
              const m = Math.floor((l + r) / 2);
              sort(l, m);
              sort(m + 1, r);
              merge(l, m, r);
            }
            function merge(l, m, r) {
              const left = a.slice(l, m + 1),
                right = a.slice(m + 1, r + 1);
              let i = 0,
                j = 0,
                k = l;
              steps.push(
                mkStep(a, {
                  compare: range(l, r),
                  line: 5,
                  note: `Merging [${l}..${m}] with [${m + 1}..${r}].`,
                }),
              );
              while (i < left.length && j < right.length) {
                if (left[i] <= right[j]) {
                  a[k] = left[i];
                  i++;
                } else {
                  a[k] = right[j];
                  j++;
                }
                steps.push(
                  mkStep(a, {
                    swap: [k],
                    compare: range(l, r),
                    line: 5,
                    note: `Write ${a[k]} at index ${k}.`,
                  }),
                );
                k++;
              }
              while (i < left.length) {
                a[k] = left[i];
                steps.push(
                  mkStep(a, {
                    swap: [k],
                    compare: range(l, r),
                    line: 5,
                    note: `Write remaining ${a[k]}.`,
                  }),
                );
                i++;
                k++;
              }
              while (j < right.length) {
                a[k] = right[j];
                steps.push(
                  mkStep(a, {
                    swap: [k],
                    compare: range(l, r),
                    line: 5,
                    note: `Write remaining ${a[k]}.`,
                  }),
                );
                j++;
                k++;
              }
            }
            sort(0, n - 1);
            steps.push(
              mkStep(a, {
                sorted: range(0, n - 1),
                line: 0,
                note: "Array is sorted.",
              }),
            );
            return steps;
          }
          function quickSteps(input) {
            const a = input.slice(),
              n = a.length,
              steps = [];
            steps.push(
              mkStep(a, {
                line: 0,
                note: "Starting quicksort — pick a pivot, partition around it, recurse.",
              }),
            );
            function qs(lo, hi) {
              if (lo > hi) return;
              if (lo === hi) {
                steps.push(
                  mkStep(a, {
                    sorted: [lo],
                    line: 1,
                    note: `Single element at ${lo} is trivially sorted.`,
                  }),
                );
                return;
              }
              const p = partition(lo, hi);
              qs(lo, p - 1);
              qs(p + 1, hi);
            }
            function partition(lo, hi) {
              const pivot = a[hi];
              let i = lo - 1;
              steps.push(
                mkStep(a, {
                  pivot: hi,
                  line: 7,
                  note: `Pivot is a[${hi}]=${pivot}.`,
                }),
              );
              for (let j = lo; j < hi; j++) {
                steps.push(
                  mkStep(a, {
                    pivot: hi,
                    compare: [j],
                    line: 9,
                    note: `Compare a[${j}]=${a[j]} with pivot ${pivot}.`,
                  }),
                );
                if (a[j] < pivot) {
                  i++;
                  [a[i], a[j]] = [a[j], a[i]];
                  steps.push(
                    mkStep(a, {
                      pivot: hi,
                      swap: [i, j],
                      line: 10,
                      note: `Smaller than pivot — move it left.`,
                    }),
                  );
                }
              }
              [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
              steps.push(
                mkStep(a, {
                  swap: [i + 1, hi],
                  sorted: [i + 1],
                  line: 11,
                  note: `Pivot settles at index ${i + 1}.`,
                }),
              );
              return i + 1;
            }
            qs(0, n - 1);
            steps.push(
              mkStep(a, {
                sorted: range(0, n - 1),
                line: 0,
                note: "Array is sorted.",
              }),
            );
            return steps;
          }

          const CODE = {
            pseudo: {
              bubble: [
                "function bubbleSort(a):",
                "  for i from 0 to n-2:",
                "    for j from 0 to n-2-i:",
                "      if a[j] > a[j+1]:",
                "        swap(a[j], a[j+1])",
                "  return a",
              ],
              selection: [
                "function selectionSort(a):",
                "  for i from 0 to n-2:",
                "    min = i",
                "    for j from i+1 to n-1:",
                "      if a[j] < a[min]:",
                "        min = j",
                "    swap(a[i], a[min])",
                "  return a",
              ],
              insertion: [
                "function insertionSort(a):",
                "  for i from 1 to n-1:",
                "    key = a[i]; j = i-1",
                "    while j>=0 and a[j] > key:",
                "      a[j+1] = a[j]",
                "      j = j-1",
                "",
                "    a[j+1] = key",
                "  return a",
              ],
              merge: [
                "function mergeSort(a, l, r):",
                "  if l >= r: return",
                "  m = (l + r) / 2",
                "  mergeSort(a, l, m)",
                "  mergeSort(a, m+1, r)",
                "  merge(a, l, m, r)",
              ],
              quick: [
                "function quickSort(a, lo, hi):",
                "  if lo >= hi: return",
                "",
                "",
                "",
                "",
                "function partition(a, lo, hi):",
                "  pivot = a[hi]",
                "  i = lo - 1",
                "  for j from lo to hi-1:",
                "    if a[j] < pivot: i++, swap(a[i],a[j])",
                "  swap(a[i+1], a[hi]); return i+1",
              ],
            },
            c: {
              bubble: [
                "void bubbleSort(int a[], int n) {",
                "  for (int i = 0; i < n - 1; i++)",
                "    for (int j = 0; j < n - 1 - i; j++)",
                "      if (a[j] > a[j + 1]) {",
                "        int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;",
                "      } }",
              ],
              selection: [
                "void selectionSort(int a[], int n) {",
                "  for (int i = 0; i < n - 1; i++) {",
                "    int min = i;",
                "    for (int j = i + 1; j < n; j++)",
                "      if (a[j] < a[min])",
                "        min = j;",
                "    int t=a[i]; a[i]=a[min]; a[min]=t;",
                "  } }",
              ],
              insertion: [
                "void insertionSort(int a[], int n) {",
                "  for (int i = 1; i < n; i++) {",
                "    int key = a[i], j = i - 1;",
                "    while (j >= 0 && a[j] > key) {",
                "      a[j + 1] = a[j];",
                "      j = j - 1;",
                "    }",
                "    a[j + 1] = key;",
                "  } }",
              ],
              merge: [
                "void mergeSort(int a[], int l, int r) {",
                "  if (l >= r) return;",
                "  int m = (l + r) / 2;",
                "  mergeSort(a, l, m);",
                "  mergeSort(a, m + 1, r);",
                "  merge(a, l, m, r); }",
              ],
              quick: [
                "void quickSort(int a[], int lo, int hi) {",
                "  if (lo >= hi) return;",
                "  int p = partition(a, lo, hi);",
                "  quickSort(a, lo, p - 1);",
                "  quickSort(a, p + 1, hi);",
                "}",
                "int partition(int a[], int lo, int hi) {",
                "  int pivot = a[hi];",
                "  int i = lo - 1;",
                "  for (int j = lo; j < hi; j++)",
                "    if (a[j] < pivot) { i++; int t=a[i]; a[i]=a[j]; a[j]=t; }",
                "  int t=a[i+1]; a[i+1]=a[hi]; a[hi]=t; return i + 1; }",
              ],
            },
            cpp: {
              bubble: [
                "void bubbleSort(vector<int>& a) {",
                "  for (int i = 0; i < a.size() - 1; i++)",
                "    for (int j = 0; j < a.size() - 1 - i; j++)",
                "      if (a[j] > a[j + 1]) {",
                "        swap(a[j], a[j + 1]);",
                "      } }",
              ],
              selection: [
                "void selectionSort(vector<int>& a) {",
                "  for (int i = 0; i < a.size() - 1; i++) {",
                "    int mn = i;",
                "    for (int j = i + 1; j < a.size(); j++)",
                "      if (a[j] < a[mn])",
                "        mn = j;",
                "    swap(a[i], a[mn]);",
                "  } }",
              ],
              insertion: [
                "void insertionSort(vector<int>& a) {",
                "  for (int i = 1; i < a.size(); i++) {",
                "    int key = a[i], j = i - 1;",
                "    while (j >= 0 && a[j] > key) {",
                "      a[j + 1] = a[j];",
                "      j--;",
                "    }",
                "    a[j + 1] = key;",
                "  } }",
              ],
              merge: [
                "void mergeSort(vector<int>& a, int l, int r) {",
                "  if (l >= r) return;",
                "  int m = (l + r) / 2;",
                "  mergeSort(a, l, m);",
                "  mergeSort(a, m + 1, r);",
                "  merge(a, l, m, r); }",
              ],
              quick: [
                "void quickSort(vector<int>& a, int lo, int hi) {",
                "  if (lo >= hi) return;",
                "  int p = partition(a, lo, hi);",
                "  quickSort(a, lo, p - 1);",
                "  quickSort(a, p + 1, hi);",
                "}",
                "int partition(vector<int>& a, int lo, int hi) {",
                "  int pivot = a[hi];",
                "  int i = lo - 1;",
                "  for (int j = lo; j < hi; j++)",
                "    if (a[j] < pivot) swap(a[++i], a[j]);",
                "  swap(a[i + 1], a[hi]); return i + 1; }",
              ],
            },
            java: {
              bubble: [
                "static void bubbleSort(int[] a) {",
                "  for (int i = 0; i < a.length - 1; i++)",
                "    for (int j = 0; j < a.length - 1 - i; j++)",
                "      if (a[j] > a[j + 1]) {",
                "        int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;",
                "      } }",
              ],
              selection: [
                "static void selectionSort(int[] a) {",
                "  for (int i = 0; i < a.length - 1; i++) {",
                "    int min = i;",
                "    for (int j = i + 1; j < a.length; j++)",
                "      if (a[j] < a[min])",
                "        min = j;",
                "    int t=a[i]; a[i]=a[min]; a[min]=t;",
                "  } }",
              ],
              insertion: [
                "static void insertionSort(int[] a) {",
                "  for (int i = 1; i < a.length; i++) {",
                "    int key = a[i], j = i - 1;",
                "    while (j >= 0 && a[j] > key) {",
                "      a[j + 1] = a[j];",
                "      j = j - 1;",
                "    }",
                "    a[j + 1] = key;",
                "  } }",
              ],
              merge: [
                "static void mergeSort(int[] a, int l, int r) {",
                "  if (l >= r) return;",
                "  int m = (l + r) / 2;",
                "  mergeSort(a, l, m);",
                "  mergeSort(a, m + 1, r);",
                "  merge(a, l, m, r); }",
              ],
              quick: [
                "static void quickSort(int[] a, int lo, int hi) {",
                "  if (lo >= hi) return;",
                "  int p = partition(a, lo, hi);",
                "  quickSort(a, lo, p - 1);",
                "  quickSort(a, p + 1, hi);",
                "}",
                "static int partition(int[] a, int lo, int hi) {",
                "  int pivot = a[hi];",
                "  int i = lo - 1;",
                "  for (int j = lo; j < hi; j++)",
                "    if (a[j] < pivot) { i++; int t=a[i]; a[i]=a[j]; a[j]=t; }",
                "  int t=a[i+1]; a[i+1]=a[hi]; a[hi]=t; return i + 1; }",
              ],
            },
          };
          const INFO = {
            bubble: {
              name: "Bubble Sort",
              best: "O(n)",
              avg: "O(n\u00B2)",
              worst: "O(n\u00B2)",
              space: "O(1)",
              stable: "Stable",
            },
            selection: {
              name: "Selection Sort",
              best: "O(n\u00B2)",
              avg: "O(n\u00B2)",
              worst: "O(n\u00B2)",
              space: "O(1)",
              stable: "Unstable",
            },
            insertion: {
              name: "Insertion Sort",
              best: "O(n)",
              avg: "O(n\u00B2)",
              worst: "O(n\u00B2)",
              space: "O(1)",
              stable: "Stable",
            },
            merge: {
              name: "Merge Sort",
              best: "O(n log n)",
              avg: "O(n log n)",
              worst: "O(n log n)",
              space: "O(n)",
              stable: "Stable",
            },
            quick: {
              name: "Quick Sort",
              best: "O(n log n)",
              avg: "O(n log n)",
              worst: "O(n\u00B2)",
              space: "O(log n)",
              stable: "Unstable",
            },
          };
          const GEN = {
            bubble: bubbleSteps,
            selection: selectionSteps,
            insertion: insertionSteps,
            merge: mergeSteps,
            quick: quickSteps,
          };

          let currentArray = randomArray(12);

          function renderArray(container, step) {
            container.innerHTML = "";
            const arr = step.arr,
              n = arr.length;
            const max = Math.max(...arr, 1);
            const wrapW = container.clientWidth || 640;
            const W = Math.max(wrapW, n * 34);
            const H = 220,
              gap = 8;
            const barW = Math.max((W - gap * (n + 1)) / n, 14);
            const svg = svgEl("svg", {
              viewBox: `0 0 ${W} ${H}`,
              width: "100%",
              height: H,
              class: "array-svg",
            });
            arr.forEach((v, i) => {
              const h = (v / max) * (H - 56);
              const x = gap + i * (barW + gap);
              const y = H - 30 - h;
              let cls = "bar";
              if (step.sorted && step.sorted.includes(i)) cls += " bar-sorted";
              if (step.compare && step.compare.includes(i))
                cls += " bar-compare";
              if (step.swap && step.swap.includes(i)) cls += " bar-swap";
              if (step.pivot === i) cls += " bar-pivot";
              svg.appendChild(
                svgEl("rect", {
                  x,
                  y,
                  width: barW,
                  height: Math.max(h, 2),
                  rx: 3,
                  class: cls,
                }),
              );
              if (barW > 16) {
                const lbl = svgEl("text", {
                  x: x + barW / 2,
                  y: H - 12,
                  class: "bar-label",
                  "text-anchor": "middle",
                });
                lbl.textContent = v;
                svg.appendChild(lbl);
              }
            });
            container.appendChild(svg);
          }

          const player = makePlayer((step, idx, len) => {
            renderArray($("#sortSvgWrap"), step);
            $("#sortNarration").textContent = step.note;
            $("#sortProgress").textContent = `Step ${idx + 1} / ${len}`;
            const algo = $("#sortAlgo").value;
            const lines = CODE[currentLang][algo];
            renderCode(
              $("#sortCode"),
              lines,
              currentLang === "pseudo"
                ? step.line
                : step.line < lines.length
                  ? step.line
                  : -1,
            );
            $("#sortPlay").textContent = player.playing ? "⏸ Pause" : "▶ Play";
          });
          onLangChange(() => player.refresh());
          wireCopyButton("sortCodeCopy", () =>
            CODE[currentLang][$("#sortAlgo").value].join("\n"),
          );

          function regenerate() {
            const algo = $("#sortAlgo").value;
            $("#sortAlgoName").textContent = INFO[algo].name;
            const info = INFO[algo];
            renderInfoGrid($("#sortInfo"), [
              { k: "Best", v: info.best },
              { k: "Average", v: info.avg },
              { k: "Worst", v: info.worst },
              { k: "Space", v: info.space },
              { k: "Stability", v: info.stable },
            ]);
            player.setSteps(GEN[algo](currentArray));
          }

          $("#sortAlgo").addEventListener("change", regenerate);
          $("#sortSize").addEventListener("input", () => {
            currentArray = randomArray(+$("#sortSize").value);
            regenerate();
          });
          $("#sortShuffle").addEventListener("click", () => {
            currentArray = randomArray(+$("#sortSize").value);
            regenerate();
          });
          $("#sortApplyCustom").addEventListener("click", () => {
            const vals = $("#sortCustom")
              .value.split(",")
              .map((s) => parseInt(s.trim(), 10))
              .filter((v) => !isNaN(v));
            if (vals.length >= 2) {
              currentArray = vals.slice(0, 30);
              $("#sortSize").value = currentArray.length;
              regenerate();
            }
          });
          $("#sortSpeed").addEventListener("input", () =>
            player.setSpeed(1050 - +$("#sortSpeed").value),
          );
          $("#sortPlay").addEventListener("click", () => {
            if (player.playing) player.pause();
            else player.play();
            $("#sortPlay").textContent = player.playing ? "⏸ Pause" : "▶ Play";
          });
          $("#sortStepFwd").addEventListener("click", () => {
            player.pause();
            player.stepFwd();
            $("#sortPlay").textContent = "▶ Play";
          });
          $("#sortStepBack").addEventListener("click", () => {
            player.stepBack();
            $("#sortPlay").textContent = "▶ Play";
          });
          $("#sortReset").addEventListener("click", () => {
            player.reset();
            $("#sortPlay").textContent = "▶ Play";
          });

          regenerate();
        })();

        /* ============================================================
   SEARCHING
   ============================================================ */
        (function () {
          function mkStep(a, extra) {
            return Object.assign(
              {
                arr: a.slice(),
                compare: [],
                swap: [],
                sorted: [],
                pivot: null,
                line: 0,
                note: "",
              },
              extra,
            );
          }
          function linearSteps(input, target) {
            const a = input.slice(),
              steps = [];
            steps.push(
              mkStep(a, {
                line: 0,
                note: `Scanning left to right for ${target}.`,
              }),
            );
            for (let i = 0; i < a.length; i++) {
              steps.push(
                mkStep(a, {
                  compare: [i],
                  line: 2,
                  note: `Check index ${i}: is ${a[i]} equal to ${target}?`,
                }),
              );
              if (a[i] === target) {
                steps.push(
                  mkStep(a, {
                    sorted: [i],
                    line: 3,
                    note: `Found ${target} at index ${i}.`,
                  }),
                );
                return steps;
              }
            }
            steps.push(
              mkStep(a, { line: 4, note: `${target} is not in the array.` }),
            );
            return steps;
          }
          function binarySteps(input, target) {
            const a = input.slice().sort((x, y) => x - y),
              steps = [];
            let lo = 0,
              hi = a.length - 1;
            steps.push(
              mkStep(a, {
                line: 1,
                note: `Array sorted first. Searching for ${target} between index ${lo} and ${hi}.`,
              }),
            );
            while (lo <= hi) {
              const mid = Math.floor((lo + hi) / 2);
              steps.push(
                mkStep(a, {
                  compare: [mid],
                  line: 3,
                  note: `Middle of [${lo},${hi}] is index ${mid}: a[${mid}]=${a[mid]}.`,
                }),
              );
              if (a[mid] === target) {
                steps.push(
                  mkStep(a, {
                    sorted: [mid],
                    line: 4,
                    note: `Found ${target} at index ${mid}.`,
                  }),
                );
                return steps;
              } else if (a[mid] < target) {
                steps.push(
                  mkStep(a, {
                    compare: [mid],
                    line: 6,
                    note: `${a[mid]} < ${target} — search the right half.`,
                  }),
                );
                lo = mid + 1;
              } else {
                steps.push(
                  mkStep(a, {
                    compare: [mid],
                    line: 8,
                    note: `${a[mid]} > ${target} — search the left half.`,
                  }),
                );
                hi = mid - 1;
              }
            }
            steps.push(
              mkStep(a, { line: 10, note: `${target} is not in the array.` }),
            );
            return steps;
          }
          const CODE = {
            pseudo: {
              linear: [
                "function linearSearch(a, target):",
                "  for i from 0 to n-1:",
                "    if a[i] == target:",
                "      return i",
                "  return -1",
              ],
              binary: [
                "function binarySearch(a, target):",
                "  lo = 0; hi = n-1",
                "  while lo <= hi:",
                "    mid = (lo+hi) / 2",
                "    if a[mid] == target:",
                "      return mid",
                "    else if a[mid] < target:",
                "      lo = mid + 1",
                "    else:",
                "      hi = mid - 1",
                "  return -1",
              ],
            },
            c: {
              linear: [
                "int linearSearch(int a[], int n, int target) {",
                "  for (int i = 0; i < n; i++)",
                "    if (a[i] == target)",
                "      return i;",
                "  return -1; }",
              ],
              binary: [
                "int binarySearch(int a[], int n, int target) {",
                "  int lo = 0, hi = n - 1;",
                "  while (lo <= hi) {",
                "    int mid = (lo + hi) / 2;",
                "    if (a[mid] == target)",
                "      return mid;",
                "    else if (a[mid] < target)",
                "      lo = mid + 1;",
                "    else",
                "      hi = mid - 1;",
                "  } return -1; }",
              ],
            },
            cpp: {
              linear: [
                "int linearSearch(vector<int>& a, int target) {",
                "  for (int i = 0; i < a.size(); i++)",
                "    if (a[i] == target)",
                "      return i;",
                "  return -1; }",
              ],
              binary: [
                "int binarySearch(vector<int>& a, int target) {",
                "  int lo = 0, hi = a.size() - 1;",
                "  while (lo <= hi) {",
                "    int mid = (lo + hi) / 2;",
                "    if (a[mid] == target)",
                "      return mid;",
                "    else if (a[mid] < target)",
                "      lo = mid + 1;",
                "    else",
                "      hi = mid - 1;",
                "  } return -1; }",
              ],
            },
            java: {
              linear: [
                "static int linearSearch(int[] a, int target) {",
                "  for (int i = 0; i < a.length; i++)",
                "    if (a[i] == target)",
                "      return i;",
                "  return -1; }",
              ],
              binary: [
                "static int binarySearch(int[] a, int target) {",
                "  int lo = 0, hi = a.length - 1;",
                "  while (lo <= hi) {",
                "    int mid = (lo + hi) / 2;",
                "    if (a[mid] == target)",
                "      return mid;",
                "    else if (a[mid] < target)",
                "      lo = mid + 1;",
                "    else",
                "      hi = mid - 1;",
                "  } return -1; }",
              ],
            },
          };
          const INFO = {
            linear: {
              name: "Linear Search",
              best: "O(1)",
              avg: "O(n)",
              worst: "O(n)",
              space: "O(1)",
              req: "None",
            },
            binary: {
              name: "Binary Search",
              best: "O(1)",
              avg: "O(log n)",
              worst: "O(log n)",
              space: "O(1)",
              req: "Sorted array",
            },
          };
          const GEN = { linear: linearSteps, binary: binarySteps };
          let currentArray = randomArray(12);

          function renderArray(container, step) {
            container.innerHTML = "";
            const arr = step.arr,
              n = arr.length;
            const max = Math.max(...arr, 1);
            const wrapW = container.clientWidth || 640;
            const W = Math.max(wrapW, n * 34),
              H = 220,
              gap = 8;
            const barW = Math.max((W - gap * (n + 1)) / n, 14);
            const svg = svgEl("svg", {
              viewBox: `0 0 ${W} ${H}`,
              width: "100%",
              height: H,
              class: "array-svg",
            });
            arr.forEach((v, i) => {
              const h = (v / max) * (H - 56);
              const x = gap + i * (barW + gap);
              const y = H - 30 - h;
              let cls = "bar";
              if (step.sorted && step.sorted.includes(i)) cls += " bar-sorted";
              if (step.compare && step.compare.includes(i))
                cls += " bar-compare";
              svg.appendChild(
                svgEl("rect", {
                  x,
                  y,
                  width: barW,
                  height: Math.max(h, 2),
                  rx: 3,
                  class: cls,
                }),
              );
              if (barW > 16) {
                const lbl = svgEl("text", {
                  x: x + barW / 2,
                  y: H - 12,
                  class: "bar-label",
                  "text-anchor": "middle",
                });
                lbl.textContent = v;
                svg.appendChild(lbl);
              }
            });
            container.appendChild(svg);
          }

          const player = makePlayer((step, idx, len) => {
            renderArray($("#searchSvgWrap"), step);
            $("#searchNarration").textContent = step.note;
            $("#searchProgress").textContent = `Step ${idx + 1} / ${len}`;
            renderCode(
              $("#searchCode"),
              CODE[currentLang][$("#searchAlgo").value],
              step.line,
            );
            $("#searchPlay").textContent = player.playing
              ? "⏸ Pause"
              : "▶ Play";
          });
          onLangChange(() => player.refresh());
          wireCopyButton("searchCodeCopy", () =>
            CODE[currentLang][$("#searchAlgo").value].join("\n"),
          );

          function regenerate() {
            const algo = $("#searchAlgo").value;
            $("#searchAlgoName").textContent = INFO[algo].name;
            const info = INFO[algo];
            renderInfoGrid($("#searchInfo"), [
              { k: "Best", v: info.best },
              { k: "Average", v: info.avg },
              { k: "Worst", v: info.worst },
              { k: "Space", v: info.space },
              { k: "Requires", v: info.req },
            ]);
            let target = parseInt($("#searchTarget").value, 10);
            if (isNaN(target))
              target = currentArray[randInt(0, currentArray.length - 1)];
            $("#searchTarget").value = target;
            player.setSteps(GEN[algo](currentArray, target));
          }
          $("#searchAlgo").addEventListener("change", regenerate);
          $("#searchSize").addEventListener("input", () => {
            currentArray = randomArray(+$("#searchSize").value);
            regenerate();
          });
          $("#searchShuffle").addEventListener("click", () => {
            currentArray = randomArray(+$("#searchSize").value);
            $("#searchTarget").value = "";
            regenerate();
          });
          $("#searchTarget").addEventListener("change", regenerate);
          $("#searchSpeed").addEventListener("input", () =>
            player.setSpeed(1050 - +$("#searchSpeed").value),
          );
          $("#searchPlay").addEventListener("click", () => {
            if (player.playing) player.pause();
            else player.play();
            $("#searchPlay").textContent = player.playing
              ? "⏸ Pause"
              : "▶ Play";
          });
          $("#searchStepFwd").addEventListener("click", () => {
            player.pause();
            player.stepFwd();
            $("#searchPlay").textContent = "▶ Play";
          });
          $("#searchStepBack").addEventListener("click", () => {
            player.stepBack();
            $("#searchPlay").textContent = "▶ Play";
          });
          $("#searchReset").addEventListener("click", () => {
            player.reset();
            $("#searchPlay").textContent = "▶ Play";
          });

          regenerate();
        })();

        /* ============================================================
   STACK & QUEUE
   ============================================================ */
        (function () {
          let mode = "stack";
          let stackArr = [];
          let queueArr = [];
          const CODE = {
            pseudo: {
              stack: [
                "push(v):  items.append(v)",
                "pop():    return items.pop()   // removes from the top",
                "peek():   return items[-1]",
                "",
                "Only the top is ever touched — that's",
                "what makes push/pop O(1).",
              ],
              queue: [
                "enqueue(v): items.append(v)      // joins the rear",
                "dequeue():  return items.pop(0)  // leaves from the front",
                "peek():     return items[0]",
                "",
                "A real implementation uses a ring buffer",
                "or two stacks to keep this O(1) too.",
              ],
            },
            c: {
              stack: [
                "#define MAX 100",
                "int items[MAX], top = -1;",
                "void push(int v) { items[++top] = v; }",
                "int pop()  { return items[top--]; }",
                "int peek() { return items[top]; }",
              ],
              queue: [
                "#define MAX 100",
                "int items[MAX], head = 0, tail = 0;",
                "void enqueue(int v) { items[tail++] = v; }",
                "int dequeue() { return items[head++]; }",
                "int peek()    { return items[head]; }",
              ],
            },
            cpp: {
              stack: [
                "#include <stack>",
                "stack<int> s;",
                "s.push(v);                   // push",
                "int x = s.top(); s.pop();    // pop",
                "int y = s.top();             // peek",
              ],
              queue: [
                "#include <queue>",
                "queue<int> q;",
                "q.push(v);                   // enqueue",
                "int x = q.front(); q.pop();  // dequeue",
                "int y = q.front();           // peek",
              ],
            },
            java: {
              stack: [
                "Deque<Integer> stack = new ArrayDeque<>();",
                "stack.push(v);          // push",
                "int x = stack.pop();    // pop",
                "int y = stack.peek();   // peek",
              ],
              queue: [
                "Queue<Integer> queue = new LinkedList<>();",
                "queue.offer(v);         // enqueue",
                "int x = queue.poll();   // dequeue",
                "int y = queue.peek();   // peek",
              ],
            },
          };
          const INFO = {
            stack: [
              { k: "Push", v: "O(1)" },
              { k: "Pop", v: "O(1)" },
              { k: "Peek", v: "O(1)" },
              { k: "Search", v: "O(n)" },
            ],
            queue: [
              { k: "Enqueue", v: "O(1)" },
              { k: "Dequeue", v: "O(1)*" },
              { k: "Peek", v: "O(1)" },
              { k: "Search", v: "O(n)" },
            ],
          };

          function renderOps() {
            const wrap = $("#sqOps");
            wrap.innerHTML = "";
            if (mode === "stack") {
              wrap.appendChild(
                el("button", { class: "btn primary", id: "sqPush" }, ["Push"]),
              );
              wrap.appendChild(
                el("button", { class: "btn", id: "sqPop" }, ["Pop"]),
              );
              wrap.appendChild(
                el("button", { class: "btn ghost", id: "sqPeek" }, ["Peek"]),
              );
              $("#sqPush").addEventListener("click", doPush);
              $("#sqPop").addEventListener("click", doPop);
              $("#sqPeek").addEventListener("click", doPeek);
            } else {
              wrap.appendChild(
                el("button", { class: "btn primary", id: "sqPush" }, [
                  "Enqueue",
                ]),
              );
              wrap.appendChild(
                el("button", { class: "btn", id: "sqPop" }, ["Dequeue"]),
              );
              wrap.appendChild(
                el("button", { class: "btn ghost", id: "sqPeek" }, ["Peek"]),
              );
              $("#sqPush").addEventListener("click", doPush);
              $("#sqPop").addEventListener("click", doPop);
              $("#sqPeek").addEventListener("click", doPeek);
            }
          }

          function currentArr() {
            return mode === "stack" ? stackArr : queueArr;
          }

          function render(flashLast) {
            const stage = $("#sqStage");
            stage.innerHTML = "";
            const arr = currentArr();
            if (arr.length === 0) {
              stage.appendChild(
                el("div", { class: "empty-note" }, [
                  mode === "stack" ? "Stack is empty." : "Queue is empty.",
                ]),
              );
              return;
            }
            if (mode === "stack") {
              const box = el("div", { class: "stack-stage" });
              arr.forEach((v, i) => {
                const b = el(
                  "div",
                  {
                    class:
                      "block" +
                      (i === arr.length - 1 && flashLast ? " enter" : ""),
                  },
                  [String(v)],
                );
                box.appendChild(b);
              });
              box.appendChild(
                el("div", { class: "slot-label" }, ["\u2191 bottom of stack"]),
              );
              stage.appendChild(box);
              const topLbl = el(
                "div",
                { class: "slot-label", style: "margin-bottom:6px;" },
                ["top / next out \u2193"],
              );
              stage.insertBefore(topLbl, stage.firstChild);
            } else {
              const box = el("div", { class: "queue-stage" });
              box.appendChild(
                el("div", { class: "slot-label" }, ["front \u2192"]),
              );
              arr.forEach((v, i) => {
                box.appendChild(
                  el(
                    "div",
                    {
                      class:
                        "block" +
                        (i === arr.length - 1 && flashLast ? " enter" : ""),
                    },
                    [String(v)],
                  ),
                );
              });
              box.appendChild(
                el("div", { class: "slot-label" }, ["\u2190 rear"]),
              );
              stage.appendChild(box);
            }
          }

          function doPush() {
            const val = $("#sqValue").value.trim();
            if (val === "") {
              $("#sqNarration").textContent = "Type a value first.";
              return;
            }
            currentArr().push(val);
            render(true);
            $("#sqNarration").textContent =
              mode === "stack"
                ? `Pushed ${val} onto the top.`
                : `Enqueued ${val} at the rear.`;
            $("#sqValue").value = "";
          }
          function doPop() {
            const arr = currentArr();
            if (arr.length === 0) {
              $("#sqNarration").textContent =
                "Nothing to remove — it\u2019s empty.";
              return;
            }
            const removed = mode === "stack" ? arr.pop() : arr.shift();
            render(false);
            $("#sqNarration").textContent =
              mode === "stack"
                ? `Popped ${removed} from the top.`
                : `Dequeued ${removed} from the front.`;
          }
          function doPeek() {
            const arr = currentArr();
            if (arr.length === 0) {
              $("#sqNarration").textContent =
                "Nothing to peek at — it\u2019s empty.";
              return;
            }
            const v = mode === "stack" ? arr[arr.length - 1] : arr[0];
            $("#sqNarration").textContent = `Peek: ${v} (still in place).`;
          }

          $("#sqStackBtn").addEventListener("click", () => {
            mode = "stack";
            $("#sqStackBtn").classList.add("active");
            $("#sqQueueBtn").classList.remove("active");
            refreshChrome();
          });
          $("#sqQueueBtn").addEventListener("click", () => {
            mode = "queue";
            $("#sqQueueBtn").classList.add("active");
            $("#sqStackBtn").classList.remove("active");
            refreshChrome();
          });
          $("#sqClear").addEventListener("click", () => {
            currentArr().length = 0;
            render(false);
            $("#sqNarration").textContent = "Cleared.";
          });

          function refreshChrome() {
            renderOps();
            render(false);
            renderCode($("#sqCode"), CODE[currentLang][mode], -1);
            renderInfoGrid($("#sqInfo"), INFO[mode]);
            $("#sqNarration").textContent =
              mode === "stack"
                ? "Push a value to get started."
                : "Enqueue a value to get started.";
          }
          onLangChange(refreshChrome);
          wireCopyButton("sqCodeCopy", () =>
            CODE[currentLang][mode].join("\n"),
          );
          refreshChrome();
        })();

        /* ============================================================
   LINKED LIST
   ============================================================ */
        (function () {
          class LLNode {
            constructor(v) {
              this.value = v;
              this.next = null;
            }
          }
          class LinkedList {
            constructor() {
              this.head = null;
            }
            toArray() {
              const out = [];
              let cur = this.head;
              while (cur) {
                out.push(cur.value);
                cur = cur.next;
              }
              return out;
            }
            insertHead(v) {
              const n = new LLNode(v);
              n.next = this.head;
              this.head = n;
            }
            insertTail(v) {
              const n = new LLNode(v);
              if (!this.head) {
                this.head = n;
                return;
              }
              let cur = this.head;
              while (cur.next) cur = cur.next;
              cur.next = n;
            }
            insertAt(idx, v) {
              if (idx <= 0) {
                this.insertHead(v);
                return;
              }
              let cur = this.head,
                i = 0;
              while (cur && i < idx - 1) {
                cur = cur.next;
                i++;
              }
              if (!cur) {
                this.insertTail(v);
                return;
              }
              const n = new LLNode(v);
              n.next = cur.next;
              cur.next = n;
            }
            deleteValue(v) {
              if (!this.head) return false;
              if (String(this.head.value) === String(v)) {
                this.head = this.head.next;
                return true;
              }
              let cur = this.head;
              while (cur.next && String(cur.next.value) !== String(v))
                cur = cur.next;
              if (cur.next) {
                cur.next = cur.next.next;
                return true;
              }
              return false;
            }
          }
          const list = new LinkedList();
          list.insertTail(12);
          list.insertTail(4);
          list.insertTail(9);

          function render(highlightIdx, foundIdx) {
            const stage = $("#llStage");
            stage.innerHTML = "";
            const arr = list.toArray();
            if (arr.length === 0) {
              stage.appendChild(
                el("div", { class: "empty-note" }, [
                  "List is empty — insert a value.",
                ]),
              );
              return;
            }
            arr.forEach((v, i) => {
              let cls = "ll-node";
              if (i === highlightIdx) cls += " flash";
              if (i === foundIdx) cls += " found";
              const node = el("div", { class: cls }, [
                el("div", { class: "val" }, [String(v)]),
                el("div", { class: "ptr" }, ["\u2022"]),
              ]);
              stage.appendChild(node);
              stage.appendChild(el("div", { class: "ll-arrow" }, ["\u2192"]));
            });
            stage.appendChild(el("div", { class: "ll-null" }, ["NULL"]));
          }

          function animateWalk(targetValue, onDone) {
            const arr = list.toArray();
            let i = 0;
            (function step() {
              if (i >= arr.length) {
                render(null, null);
                $("#llNarration").textContent =
                  `Reached the end — ${targetValue} is not in the list.`;
                onDone && onDone(-1);
                return;
              }
              render(i, null);
              $("#llNarration").textContent =
                `At index ${i}: is ${arr[i]} equal to ${targetValue}?`;
              if (String(arr[i]) === String(targetValue)) {
                setTimeout(() => {
                  render(null, i);
                  $("#llNarration").textContent =
                    `Found ${targetValue} at index ${i}.`;
                  onDone && onDone(i);
                }, 380);
                return;
              }
              i++;
              setTimeout(step, 420);
            })();
          }

          $("#llInsertHead").addEventListener("click", () => {
            const v = $("#llValue").value.trim();
            if (v === "") {
              $("#llNarration").textContent = "Type a value first.";
              return;
            }
            list.insertHead(v);
            render(0, null);
            $("#llNarration").textContent =
              `Inserted ${v} at the head — O(1), no walking required.`;
            $("#llValue").value = "";
          });
          $("#llInsertTail").addEventListener("click", () => {
            const v = $("#llValue").value.trim();
            if (v === "") {
              $("#llNarration").textContent = "Type a value first.";
              return;
            }
            list.insertTail(v);
            const arr = list.toArray();
            render(arr.length - 1, null);
            $("#llNarration").textContent =
              `Inserted ${v} at the tail — had to walk the whole list first.`;
            $("#llValue").value = "";
          });
          $("#llInsertAt").addEventListener("click", () => {
            const v = $("#llValue").value.trim();
            const idx = parseInt($("#llIndex").value, 10);
            if (v === "" || isNaN(idx)) {
              $("#llNarration").textContent = "Give both a value and an index.";
              return;
            }
            list.insertAt(idx, v);
            render(Math.min(idx, list.toArray().length - 1), null);
            $("#llNarration").textContent = `Inserted ${v} at index ${idx}.`;
            $("#llValue").value = "";
          });
          $("#llDelete").addEventListener("click", () => {
            const v = $("#llValue").value.trim();
            if (v === "") {
              $("#llNarration").textContent = "Type the value to delete.";
              return;
            }
            const ok = list.deleteValue(v);
            render(null, null);
            $("#llNarration").textContent = ok
              ? `Deleted ${v}.`
              : `${v} was not found.`;
          });
          $("#llSearch").addEventListener("click", () => {
            const v = $("#llValue").value.trim();
            if (v === "") {
              $("#llNarration").textContent = "Type a value to search for.";
              return;
            }
            animateWalk(v);
          });
          $("#llClear").addEventListener("click", () => {
            list.head = null;
            render(null, null);
            $("#llNarration").textContent = "Cleared.";
          });

          const LL_CODE = {
            pseudo: [
              "class Node:",
              "  value",
              "  next  // pointer to the next node, or NULL",
              "",
              "insertHead / insertTail / insertAt(i)",
              "deleteValue(v)   // walk until match, relink",
            ],
            c: [
              "struct Node {",
              "  int value;",
              "  struct Node* next;",
              "};",
              "",
              "void insertHead(struct Node** head, int v) {",
              "  struct Node* n = malloc(sizeof(struct Node));",
              "  n->value = v; n->next = *head; *head = n;",
              "}",
            ],
            cpp: [
              "struct Node {",
              "  int value;",
              "  Node* next;",
              "  Node(int v) : value(v), next(nullptr) {}",
              "};",
              "",
              "void insertHead(Node*& head, int v) {",
              "  Node* n = new Node(v);",
              "  n->next = head; head = n;",
              "}",
            ],
            java: [
              "class Node {",
              "  int value;",
              "  Node next;",
              "  Node(int v) { value = v; }",
              "}",
              "",
              "void insertHead(int v) {",
              "  Node n = new Node(v);",
              "  n.next = head; head = n;",
              "}",
            ],
          };
          function refreshLLCode() {
            renderCode($("#llCode"), LL_CODE[currentLang], -1);
          }
          onLangChange(refreshLLCode);
          wireCopyButton("llCodeCopy", () => LL_CODE[currentLang].join("\n"));
          refreshLLCode();
          renderInfoGrid($("#llInfo"), [
            { k: "Insert head", v: "O(1)" },
            { k: "Insert tail", v: "O(n)" },
            { k: "Insert at i", v: "O(n)" },
            { k: "Delete", v: "O(n)" },
            { k: "Search", v: "O(n)" },
            { k: "Access by index", v: "O(n)" },
          ]);
          render(null, null);
        })();

        /* ============================================================
   BINARY SEARCH TREE
   ============================================================ */
        (function () {
          let nodeIdCounter = 0;
          class TreeNode {
            constructor(v) {
              this.value = v;
              this.left = null;
              this.right = null;
              this.id = "t" + nodeIdCounter++;
            }
          }
          let root = null;

          function insert(v) {
            const n = new TreeNode(v);
            if (!root) {
              root = n;
              return;
            }
            let cur = root;
            while (true) {
              if (v === cur.value) return;
              if (v < cur.value) {
                if (!cur.left) {
                  cur.left = n;
                  return;
                }
                cur = cur.left;
              } else {
                if (!cur.right) {
                  cur.right = n;
                  return;
                }
                cur = cur.right;
              }
            }
          }

          function layout(rootNode) {
            let counter = 0;
            const pos = {};
            (function go(node, depth) {
              if (!node) return;
              go(node.left, depth + 1);
              pos[node.id] = { x: counter, y: depth };
              counter++;
              go(node.right, depth + 1);
            })(rootNode, 0);
            return pos;
          }

          function renderTree(container, opts) {
            opts = opts || {};
            container.innerHTML = "";
            if (!root) {
              container.appendChild(
                el("div", { class: "empty-note" }, [
                  "Tree is empty — insert a value to begin.",
                ]),
              );
              return;
            }
            const pos = layout(root);
            const spacingX = 58,
              spacingY = 76,
              pad = 32;
            let maxX = 0,
              maxY = 0;
            for (const k in pos) {
              maxX = Math.max(maxX, pos[k].x);
              maxY = Math.max(maxY, pos[k].y);
            }
            const W = Math.max(
              pad * 2 + maxX * spacingX + 40,
              container.clientWidth || 400,
            );
            const H = pad * 2 + maxY * spacingY + 40;
            const svg = svgEl("svg", {
              viewBox: `0 0 ${W} ${H}`,
              width: "100%",
              height: H,
            });
            function coord(node) {
              const p = pos[node.id];
              return {
                cx:
                  pad +
                  p.x * spacingX +
                  20 +
                  (W - (pad * 2 + maxX * spacingX + 40)) / 2,
                cy: pad + p.y * spacingY + 20,
              };
            }
            (function drawEdges(node) {
              if (!node) return;
              const c = coord(node);
              [node.left, node.right].forEach((ch) => {
                if (ch) {
                  const c2 = coord(ch);
                  svg.appendChild(
                    svgEl("line", {
                      x1: c.cx,
                      y1: c.cy,
                      x2: c2.cx,
                      y2: c2.cy,
                      class: "tree-edge",
                    }),
                  );
                  drawEdges(ch);
                }
              });
            })(root);
            (function drawNodes(node) {
              if (!node) return;
              const c = coord(node);
              let cls = "tree-node";
              if (opts.visiting === node.id) cls += " node-visiting";
              else if (opts.visited && opts.visited.includes(node.id))
                cls += " node-visited";
              const g = svgEl("g", { class: cls });
              g.appendChild(svgEl("circle", { cx: c.cx, cy: c.cy, r: 19 }));
              const t = svgEl("text", { x: c.cx, y: c.cy + 4 });
              t.textContent = node.value;
              g.appendChild(t);
              svg.appendChild(g);
              drawNodes(node.left);
              drawNodes(node.right);
            })(root);
            container.appendChild(svg);
          }

          function traversalOrder(kind) {
            const out = [];
            if (kind === "inorder")
              (function go(n) {
                if (!n) return;
                go(n.left);
                out.push(n);
                go(n.right);
              })(root);
            else if (kind === "preorder")
              (function go(n) {
                if (!n) return;
                out.push(n);
                go(n.left);
                go(n.right);
              })(root);
            else if (kind === "postorder")
              (function go(n) {
                if (!n) return;
                go(n.left);
                go(n.right);
                out.push(n);
              })(root);
            else if (kind === "levelorder") {
              if (root) {
                const q = [root];
                while (q.length) {
                  const n = q.shift();
                  out.push(n);
                  if (n.left) q.push(n.left);
                  if (n.right) q.push(n.right);
                }
              }
            }
            return out;
          }

          const player = makePlayer((step, idx, len) => {
            renderTree($("#treeSvgWrap"), {
              visiting: step ? step.id : null,
              visited: step ? step.visitedIds : [],
            });
            $("#treeProgress").textContent = len
              ? `Step ${idx + 1} / ${len}`
              : "Step 0 / 0";
            $("#treeResult").textContent = step
              ? step.resultSoFar.join(", ")
              : "—";
            $("#treeNarration").textContent = step
              ? `Visiting node ${step.value}.`
              : "Insert a few values, then run a traversal.";
            $("#treePlay").textContent = player.playing
              ? "⏸ Pause"
              : "▶ Traverse";
          });

          function buildSteps() {
            const order = traversalOrder($("#treeTraversal").value);
            const visitedIds = [];
            const resultSoFar = [];
            return order.map((n) => {
              visitedIds.push(n.id);
              resultSoFar.push(n.value);
              return {
                id: n.id,
                value: n.value,
                visitedIds: visitedIds.slice(),
                resultSoFar: resultSoFar.slice(),
              };
            });
          }

          const TREE_CODE = {
            pseudo: {
              inorder: [
                "function inorder(node):",
                "  if node == null: return",
                "  inorder(node.left)",
                "  visit(node)",
                "  inorder(node.right)",
              ],
              preorder: [
                "function preorder(node):",
                "  if node == null: return",
                "  visit(node)",
                "  preorder(node.left)",
                "  preorder(node.right)",
              ],
              postorder: [
                "function postorder(node):",
                "  if node == null: return",
                "  postorder(node.left)",
                "  postorder(node.right)",
                "  visit(node)",
              ],
              levelorder: [
                "function levelOrder(root):",
                "  queue = [root]",
                "  while queue not empty:",
                "    node = queue.dequeue()",
                "    visit(node)",
                "    if node.left: queue.enqueue(node.left)",
                "    if node.right: queue.enqueue(node.right)",
              ],
            },
            c: {
              inorder: [
                "void inorder(Node* node) {",
                "  if (!node) return;",
                "  inorder(node->left);",
                "  visit(node);",
                "  inorder(node->right);",
                "}",
              ],
              preorder: [
                "void preorder(Node* node) {",
                "  if (!node) return;",
                "  visit(node);",
                "  preorder(node->left);",
                "  preorder(node->right);",
                "}",
              ],
              postorder: [
                "void postorder(Node* node) {",
                "  if (!node) return;",
                "  postorder(node->left);",
                "  postorder(node->right);",
                "  visit(node);",
                "}",
              ],
              levelorder: [
                "void levelOrder(Node* root) {",
                "  Queue q; enqueue(q, root);",
                "  while (!empty(q)) {",
                "    Node* node = dequeue(q);",
                "    visit(node);",
                "    if (node->left) enqueue(q, node->left);",
                "    if (node->right) enqueue(q, node->right);",
                "  } }",
              ],
            },
            cpp: {
              inorder: [
                "void inorder(Node* node) {",
                "  if (!node) return;",
                "  inorder(node->left);",
                "  visit(node);",
                "  inorder(node->right);",
                "}",
              ],
              preorder: [
                "void preorder(Node* node) {",
                "  if (!node) return;",
                "  visit(node);",
                "  preorder(node->left);",
                "  preorder(node->right);",
                "}",
              ],
              postorder: [
                "void postorder(Node* node) {",
                "  if (!node) return;",
                "  postorder(node->left);",
                "  postorder(node->right);",
                "  visit(node);",
                "}",
              ],
              levelorder: [
                "void levelOrder(Node* root) {",
                "  queue<Node*> q; q.push(root);",
                "  while (!q.empty()) {",
                "    Node* node = q.front(); q.pop();",
                "    visit(node);",
                "    if (node->left) q.push(node->left);",
                "    if (node->right) q.push(node->right);",
                "  } }",
              ],
            },
            java: {
              inorder: [
                "void inorder(Node node) {",
                "  if (node == null) return;",
                "  inorder(node.left);",
                "  visit(node);",
                "  inorder(node.right);",
                "}",
              ],
              preorder: [
                "void preorder(Node node) {",
                "  if (node == null) return;",
                "  visit(node);",
                "  preorder(node.left);",
                "  preorder(node.right);",
                "}",
              ],
              postorder: [
                "void postorder(Node node) {",
                "  if (node == null) return;",
                "  postorder(node.left);",
                "  postorder(node.right);",
                "  visit(node);",
                "}",
              ],
              levelorder: [
                "void levelOrder(Node root) {",
                "  Queue<Node> q = new LinkedList<>(); q.add(root);",
                "  while (!q.isEmpty()) {",
                "    Node node = q.poll();",
                "    visit(node);",
                "    if (node.left != null) q.add(node.left);",
                "    if (node.right != null) q.add(node.right);",
                "  } }",
              ],
            },
          };
          function refreshTreeCode() {
            renderCode(
              $("#treeCode"),
              TREE_CODE[currentLang][$("#treeTraversal").value],
              -1,
            );
          }
          onLangChange(refreshTreeCode);
          wireCopyButton("treeCodeCopy", () =>
            TREE_CODE[currentLang][$("#treeTraversal").value].join("\n"),
          );
          refreshTreeCode();

          $("#treeInsert").addEventListener("click", () => {
            const v = parseInt($("#treeValue").value, 10);
            if (isNaN(v)) {
              $("#treeNarration").textContent = "Type a numeric value first.";
              return;
            }
            insert(v);
            $("#treeValue").value = "";
            renderTree($("#treeSvgWrap"), {});
            $("#treeNarration").textContent = `Inserted ${v}.`;
            player.setSteps([]);
            $("#treeResult").textContent = "—";
            $("#treeProgress").textContent = "Step 0 / 0";
          });
          $("#treeRandom").addEventListener("click", () => {
            root = null;
            nodeIdCounter = 0;
            const vals = new Set();
            while (vals.size < 9) vals.add(randInt(1, 99));
            [...vals].forEach(insert);
            renderTree($("#treeSvgWrap"), {});
            $("#treeNarration").textContent = "Random tree built.";
            player.setSteps([]);
            $("#treeResult").textContent = "—";
            $("#treeProgress").textContent = "Step 0 / 0";
          });
          $("#treeClear").addEventListener("click", () => {
            root = null;
            nodeIdCounter = 0;
            renderTree($("#treeSvgWrap"), {});
            $("#treeNarration").textContent = "Cleared.";
            player.setSteps([]);
            $("#treeResult").textContent = "—";
            $("#treeProgress").textContent = "Step 0 / 0";
          });
          $("#treeTraversal").addEventListener("change", () => {
            refreshTreeCode();
            if (root) player.setSteps(buildSteps());
          });
          $("#treeSpeed").addEventListener("input", () =>
            player.setSpeed(1350 - +$("#treeSpeed").value),
          );
          $("#treePlay").addEventListener("click", () => {
            if (!root) {
              $("#treeNarration").textContent = "Insert a value first.";
              return;
            }
            if (player.length === 0) player.setSteps(buildSteps());
            if (player.playing) player.pause();
            else player.play();
            $("#treePlay").textContent = player.playing
              ? "⏸ Pause"
              : "▶ Traverse";
          });
          $("#treeStepFwd").addEventListener("click", () => {
            if (!root) return;
            if (player.length === 0) player.setSteps(buildSteps());
            player.pause();
            player.stepFwd();
            $("#treePlay").textContent = "▶ Traverse";
          });
          $("#treeStepBack").addEventListener("click", () => {
            player.stepBack();
            $("#treePlay").textContent = "▶ Traverse";
          });
          $("#treeReset").addEventListener("click", () => {
            player.setSteps(root ? buildSteps() : []);
            player.reset();
            $("#treePlay").textContent = "▶ Traverse";
          });

          renderInfoGrid($("#treeInfo"), [
            { k: "Insert", v: "O(log n) / O(n)" },
            { k: "Search", v: "O(log n) / O(n)" },
            { k: "Delete", v: "O(log n) / O(n)" },
            { k: "Traversal", v: "O(n)" },
          ]);
          [8, 4, 12, 2, 6, 10, 14].forEach(insert);
          renderTree($("#treeSvgWrap"), {});
        })();

        /* ============================================================
   GRAPH TRAVERSAL
   ============================================================ */
        (function () {
          const defaultGraph = {
            A: ["B", "C"],
            B: ["A", "D", "E"],
            C: ["A", "F"],
            D: ["B"],
            E: ["B", "F"],
            F: ["C", "E", "G"],
            G: ["F"],
          };
          let graph = JSON.parse(JSON.stringify(defaultGraph));

          function nodeList() {
            return Object.keys(graph);
          }
          function addEdge(u, v) {
            if (!u || !v || u === v) return false;
            if (!graph[u]) graph[u] = [];
            if (!graph[v]) graph[v] = [];
            if (!graph[u].includes(v)) graph[u].push(v);
            if (!graph[v].includes(u)) graph[v].push(u);
            return true;
          }

          function circleLayout(nodes, W, H) {
            const cx = W / 2,
              cy = H / 2,
              r = Math.min(W, H) / 2 - 42;
            const pos = {};
            nodes.forEach((n, i) => {
              const a = -Math.PI / 2 + i * ((2 * Math.PI) / nodes.length);
              pos[n] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
            });
            return pos;
          }

          function renderGraph(container, opts) {
            opts = opts || {};
            container.innerHTML = "";
            const nodes = nodeList();
            const W = Math.max(container.clientWidth || 500, 420),
              H = 340;
            const pos = circleLayout(nodes, W, H);
            const svg = svgEl("svg", {
              viewBox: `0 0 ${W} ${H}`,
              width: "100%",
              height: H,
            });
            const drawn = new Set();
            nodes.forEach((u) => {
              (graph[u] || []).forEach((v) => {
                const key = [u, v].sort().join("-");
                if (drawn.has(key)) return;
                drawn.add(key);
                let cls = "graph-edge";
                if (
                  opts.activeEdge &&
                  ((opts.activeEdge[0] === u && opts.activeEdge[1] === v) ||
                    (opts.activeEdge[0] === v && opts.activeEdge[1] === u))
                )
                  cls += " active";
                svg.appendChild(
                  svgEl("line", {
                    x1: pos[u].x,
                    y1: pos[u].y,
                    x2: pos[v].x,
                    y2: pos[v].y,
                    class: cls,
                  }),
                );
              });
            });
            nodes.forEach((n) => {
              let cls = "graph-node";
              if (opts.current === n) cls += " current";
              else if (opts.visited && opts.visited.includes(n))
                cls += " visited";
              if (
                opts.frontier &&
                opts.frontier.includes(n) &&
                opts.current !== n
              )
                cls += " frontier";
              const g = svgEl("g", { class: cls });
              g.appendChild(
                svgEl("circle", { cx: pos[n].x, cy: pos[n].y, r: 19 }),
              );
              const t = svgEl("text", { x: pos[n].x, y: pos[n].y + 4 });
              t.textContent = n;
              g.appendChild(t);
              svg.appendChild(g);
            });
            container.appendChild(svg);
          }

          function bfsSteps(start) {
            const steps = [];
            const visited = new Set([start]);
            const q = [start];
            steps.push({
              current: null,
              visited: [...visited],
              frontier: [...q],
              note: `Start at ${start}. Add it to the queue.`,
            });
            while (q.length) {
              const cur = q.shift();
              steps.push({
                current: cur,
                visited: [...visited],
                frontier: [...q],
                note: `Dequeue and visit ${cur}.`,
              });
              for (const nb of graph[cur] || []) {
                if (!visited.has(nb)) {
                  visited.add(nb);
                  q.push(nb);
                  steps.push({
                    current: cur,
                    visited: [...visited],
                    frontier: [...q],
                    activeEdge: [cur, nb],
                    note: `${nb} is new — mark visited, enqueue it.`,
                  });
                }
              }
            }
            steps.push({
              current: null,
              visited: [...visited],
              frontier: [],
              note: "Breadth-first search complete.",
            });
            return steps;
          }
          function dfsSteps(start) {
            const steps = [];
            const visited = new Set();
            const stack = [start];
            steps.push({
              current: null,
              visited: [],
              frontier: [...stack],
              note: `Start at ${start}. Push it to the stack.`,
            });
            while (stack.length) {
              const cur = stack.pop();
              if (visited.has(cur)) continue;
              visited.add(cur);
              steps.push({
                current: cur,
                visited: [...visited],
                frontier: [...stack],
                note: `Pop and visit ${cur}.`,
              });
              const nbs = (graph[cur] || []).slice().reverse();
              for (const nb of nbs) {
                if (!visited.has(nb)) {
                  stack.push(nb);
                  steps.push({
                    current: cur,
                    visited: [...visited],
                    frontier: [...stack],
                    activeEdge: [cur, nb],
                    note: `Push unvisited neighbor ${nb}.`,
                  });
                }
              }
            }
            steps.push({
              current: null,
              visited: [...visited],
              frontier: [],
              note: "Depth-first search complete.",
            });
            return steps;
          }

          const player = makePlayer((step, idx, len) => {
            renderGraph($("#graphSvgWrap"), step);
            $("#graphNarration").textContent = step.note;
            $("#graphProgress").textContent = `Step ${idx + 1} / ${len}`;
            $("#graphFrontier").textContent = step.frontier.length
              ? step.frontier.join(", ")
              : "—";
            $("#graphPlay").textContent = player.playing
              ? "⏸ Pause"
              : "▶ Traverse";
          });

          function refreshStartOptions() {
            const sel = $("#graphStart");
            const prev = sel.value;
            sel.innerHTML = "";
            nodeList().forEach((n) =>
              sel.appendChild(el("option", { value: n }, [n])),
            );
            if (nodeList().includes(prev)) sel.value = prev;
          }
          function buildSteps() {
            const algo = $("#graphAlgo").value,
              start = $("#graphStart").value;
            return algo === "bfs" ? bfsSteps(start) : dfsSteps(start);
          }

          const GRAPH_CODE = {
            pseudo: {
              bfs: [
                "function bfs(start):",
                "  visited = {start}; queue = [start]",
                "  while queue not empty:",
                "    node = queue.dequeue()",
                "    visit(node)",
                "    for each neighbor of node:",
                "      if neighbor not in visited:",
                "        visited.add(neighbor); queue.enqueue(neighbor)",
              ],
              dfs: [
                "function dfs(start):",
                "  visited = {}; stack = [start]",
                "  while stack not empty:",
                "    node = stack.pop()",
                "    if node in visited: continue",
                "    visited.add(node); visit(node)",
                "    for each neighbor of node:",
                "      if neighbor not in visited: stack.push(neighbor)",
              ],
            },
            c: {
              bfs: [
                "void bfs(int start) {",
                "  bool visited[N] = {false};",
                "  int queue[N], head=0, tail=0;",
                "  visited[start]=true; queue[tail++]=start;",
                "  while (head < tail) {",
                "    int node = queue[head++];",
                "    visit(node);",
                "    for (int nb : adj[node])",
                "      if (!visited[nb]) { visited[nb]=true; queue[tail++]=nb; }",
                "  } }",
              ],
              dfs: [
                "void dfs(int start) {",
                "  bool visited[N] = {false};",
                "  int stack[N], top=-1;",
                "  stack[++top]=start;",
                "  while (top >= 0) {",
                "    int node = stack[top--];",
                "    if (visited[node]) continue;",
                "    visited[node]=true; visit(node);",
                "    for (int nb : adj[node])",
                "      if (!visited[nb]) stack[++top]=nb;",
                "  } }",
              ],
            },
            cpp: {
              bfs: [
                "void bfs(int start) {",
                "  vector<bool> visited(n, false);",
                "  queue<int> q; q.push(start); visited[start]=true;",
                "  while (!q.empty()) {",
                "    int node = q.front(); q.pop();",
                "    visit(node);",
                "    for (int nb : adj[node])",
                "      if (!visited[nb]) { visited[nb]=true; q.push(nb); }",
                "  } }",
              ],
              dfs: [
                "void dfs(int start) {",
                "  vector<bool> visited(n, false);",
                "  stack<int> s; s.push(start);",
                "  while (!s.empty()) {",
                "    int node = s.top(); s.pop();",
                "    if (visited[node]) continue;",
                "    visited[node]=true; visit(node);",
                "    for (int nb : adj[node])",
                "      if (!visited[nb]) s.push(nb);",
                "  } }",
              ],
            },
            java: {
              bfs: [
                "void bfs(int start) {",
                "  boolean[] visited = new boolean[n];",
                "  Queue<Integer> q = new LinkedList<>();",
                "  q.add(start); visited[start]=true;",
                "  while (!q.isEmpty()) {",
                "    int node = q.poll(); visit(node);",
                "    for (int nb : adj.get(node))",
                "      if (!visited[nb]) { visited[nb]=true; q.add(nb); }",
                "  } }",
              ],
              dfs: [
                "void dfs(int start) {",
                "  boolean[] visited = new boolean[n];",
                "  Deque<Integer> st = new ArrayDeque<>();",
                "  st.push(start);",
                "  while (!st.isEmpty()) {",
                "    int node = st.pop();",
                "    if (visited[node]) continue;",
                "    visited[node]=true; visit(node);",
                "    for (int nb : adj.get(node))",
                "      if (!visited[nb]) st.push(nb);",
                "  } }",
              ],
            },
          };
          function refreshGraphCode() {
            renderCode(
              $("#graphCode"),
              GRAPH_CODE[currentLang][$("#graphAlgo").value],
              -1,
            );
          }
          onLangChange(refreshGraphCode);
          wireCopyButton("graphCodeCopy", () =>
            GRAPH_CODE[currentLang][$("#graphAlgo").value].join("\n"),
          );
          refreshGraphCode();

          $("#graphAddEdge").addEventListener("click", () => {
            const raw = $("#graphEdge").value.trim().toUpperCase();
            const m = raw.match(/^([A-Za-z0-9]+)\s*-\s*([A-Za-z0-9]+)$/);
            if (!m) {
              $("#graphNarration").textContent = "Use the form A-B.";
              return;
            }
            addEdge(m[1], m[2]);
            refreshStartOptions();
            renderGraph($("#graphSvgWrap"), {});
            $("#graphNarration").textContent = `Added edge ${m[1]}-${m[2]}.`;
            $("#graphEdge").value = "";
            player.setSteps([]);
            $("#graphProgress").textContent = "Step 0 / 0";
            $("#graphFrontier").textContent = "—";
          });
          $("#graphResetGraph").addEventListener("click", () => {
            graph = JSON.parse(JSON.stringify(defaultGraph));
            refreshStartOptions();
            renderGraph($("#graphSvgWrap"), {});
            $("#graphNarration").textContent =
              "Graph reset to the default sample.";
            player.setSteps([]);
            $("#graphProgress").textContent = "Step 0 / 0";
            $("#graphFrontier").textContent = "—";
          });
          $("#graphAlgo").addEventListener("change", () => {
            refreshGraphCode();
            player.setSteps([]);
            $("#graphProgress").textContent = "Step 0 / 0";
            $("#graphFrontier").textContent = "—";
            renderGraph($("#graphSvgWrap"), {});
          });
          $("#graphStart").addEventListener("change", () => {
            player.setSteps([]);
            $("#graphProgress").textContent = "Step 0 / 0";
            $("#graphFrontier").textContent = "—";
            renderGraph($("#graphSvgWrap"), {});
          });
          $("#graphSpeed").addEventListener("input", () =>
            player.setSpeed(1350 - +$("#graphSpeed").value),
          );
          $("#graphPlay").addEventListener("click", () => {
            if (player.length === 0) player.setSteps(buildSteps());
            if (player.playing) player.pause();
            else player.play();
            $("#graphPlay").textContent = player.playing
              ? "⏸ Pause"
              : "▶ Traverse";
          });
          $("#graphStepFwd").addEventListener("click", () => {
            if (player.length === 0) player.setSteps(buildSteps());
            player.pause();
            player.stepFwd();
            $("#graphPlay").textContent = "▶ Traverse";
          });
          $("#graphStepBack").addEventListener("click", () => {
            player.stepBack();
            $("#graphPlay").textContent = "▶ Traverse";
          });
          $("#graphReset").addEventListener("click", () => {
            player.setSteps(buildSteps());
            player.reset();
            $("#graphPlay").textContent = "▶ Traverse";
          });

          renderInfoGrid($("#graphInfo"), [
            { k: "Time", v: "O(V + E)" },
            { k: "Space", v: "O(V)" },
            { k: "BFS finds", v: "Shortest hops" },
            { k: "DFS finds", v: "A full path" },
          ]);
          refreshStartOptions();
          renderGraph($("#graphSvgWrap"), {});
        })();

        /* ============================================================
   RECURSION
   ============================================================ */
        (function () {
          let idc = 0;
          function buildFactTree(n, depth) {
            const node = {
              id: "r" + idc++,
              label: `factorial(${n})`,
              depth: depth,
              children: [],
              value: null,
            };
            if (n <= 1) {
              node.value = 1;
            } else {
              const c = buildFactTree(n - 1, depth + 1);
              node.children.push(c);
              node.value = n * c.value;
            }
            return node;
          }
          function buildFibTree(n, depth) {
            const node = {
              id: "r" + idc++,
              label: `fib(${n})`,
              depth: depth,
              children: [],
              value: null,
            };
            if (n <= 1) {
              node.value = n;
            } else {
              const c1 = buildFibTree(n - 1, depth + 1);
              const c2 = buildFibTree(n - 2, depth + 1);
              node.children.push(c1, c2);
              node.value = c1.value + c2.value;
            }
            return node;
          }
          function treeToEvents(rootNode) {
            const events = [];
            (function go(node) {
              events.push({ type: "call", node });
              node.children.forEach(go);
              events.push({ type: "return", node });
            })(rootNode);
            return events;
          }
          function layoutNary(rootNode) {
            let leafCounter = 0;
            const pos = {};
            (function assign(node, depth) {
              if (node.children.length === 0) {
                pos[node.id] = { x: leafCounter, y: depth };
                leafCounter++;
              } else {
                node.children.forEach((c) => assign(c, depth + 1));
                const xs = node.children.map((c) => pos[c.id].x);
                pos[node.id] = {
                  x: (Math.min(...xs) + Math.max(...xs)) / 2,
                  y: depth,
                };
              }
            })(rootNode, 0);
            return pos;
          }

          let root = null,
            events = [];

          function renderTree(container, activeIds, returnedIds) {
            container.innerHTML = "";
            if (!root) return;
            const pos = layoutNary(root);
            let maxX = 0,
              maxY = 0;
            for (const k in pos) {
              maxX = Math.max(maxX, pos[k].x);
              maxY = Math.max(maxY, pos[k].y);
            }
            const spacingX = 56,
              spacingY = 64,
              pad = 30;
            const contentW = maxX * spacingX + 40;
            const W = Math.max(
              container.clientWidth || 500,
              contentW + pad * 2,
            );
            const H = pad * 2 + maxY * spacingY + 40;
            const offsetX = (W - contentW) / 2;
            const svg = svgEl("svg", {
              viewBox: `0 0 ${W} ${H}`,
              width: "100%",
              height: H,
            });
            function coord(node) {
              const p = pos[node.id];
              return {
                cx: offsetX + p.x * spacingX + 20,
                cy: pad + p.y * spacingY + 20,
              };
            }
            (function drawEdges(node) {
              const c = coord(node);
              node.children.forEach((ch) => {
                const c2 = coord(ch);
                svg.appendChild(
                  svgEl("line", {
                    x1: c.cx,
                    y1: c.cy,
                    x2: c2.cx,
                    y2: c2.cy,
                    class: "tree-edge",
                  }),
                );
                drawEdges(ch);
              });
            })(root);
            (function drawNodes(node) {
              const c = coord(node);
              let cls = "tree-node";
              if (activeIds.includes(node.id)) cls += " node-visiting";
              else if (returnedIds.includes(node.id)) cls += " node-returned";
              const g = svgEl("g", { class: cls });
              g.appendChild(svgEl("circle", { cx: c.cx, cy: c.cy, r: 24 }));
              const label = returnedIds.includes(node.id)
                ? `=${node.value}`
                : node.label.replace(/^\D+\(/, "(");
              const t = svgEl("text", { x: c.cx, y: c.cy + 4 });
              t.textContent = label;
              g.appendChild(t);
              svg.appendChild(g);
              node.children.forEach(drawNodes);
            })(root);
            container.appendChild(svg);
          }

          function stackAt(i) {
            const stack = [];
            for (let k = 0; k <= i; k++) {
              const e = events[k];
              if (e.type === "call") stack.push(e.node);
              else stack.pop();
            }
            return stack;
          }

          const player = makePlayer((step, idx, len) => {
            const active = stackAt(idx).map((n) => n.id);
            const returned = [];
            for (let k = 0; k <= idx; k++)
              if (events[k].type === "return") returned.push(events[k].node.id);
            renderTree($("#recSvgWrap"), active, returned);
            const stackBox = $("#recStack");
            stackBox.innerHTML = "";
            stackAt(idx).forEach((n) => {
              stackBox.appendChild(el("div", { class: "block" }, [n.label]));
            });
            $("#recProgress").textContent = `Step ${idx + 1} / ${len}`;
            if (step.type === "call")
              $("#recNarration").textContent =
                `Call ${step.node.label} — push a new frame onto the stack.`;
            else
              $("#recNarration").textContent =
                `${step.node.label} returns ${step.node.value} — pop its frame.`;
            $("#recResultLine").textContent = returned.includes(root.id)
              ? `Final result: ${root.value}`
              : "—";
            $("#recPlay").textContent = player.playing ? "⏸ Pause" : "▶ Play";
          });

          const REC_CODE = {
            pseudo: {
              factorial: [
                "function factorial(n):",
                "  if n <= 1: return 1",
                "  return n * factorial(n - 1)",
              ],
              fibonacci: [
                "function fib(n):",
                "  if n <= 1: return n",
                "  return fib(n-1) + fib(n-2)",
              ],
            },
            c: {
              factorial: [
                "int factorial(int n) {",
                "  if (n <= 1) return 1;",
                "  return n * factorial(n - 1);",
                "}",
              ],
              fibonacci: [
                "int fib(int n) {",
                "  if (n <= 1) return n;",
                "  return fib(n - 1) + fib(n - 2);",
                "}",
              ],
            },
            cpp: {
              factorial: [
                "int factorial(int n) {",
                "  if (n <= 1) return 1;",
                "  return n * factorial(n - 1);",
                "}",
              ],
              fibonacci: [
                "int fib(int n) {",
                "  if (n <= 1) return n;",
                "  return fib(n - 1) + fib(n - 2);",
                "}",
              ],
            },
            java: {
              factorial: [
                "static int factorial(int n) {",
                "  if (n <= 1) return 1;",
                "  return n * factorial(n - 1);",
                "}",
              ],
              fibonacci: [
                "static int fib(int n) {",
                "  if (n <= 1) return n;",
                "  return fib(n - 1) + fib(n - 2);",
                "}",
              ],
            },
          };
          function refreshRecCode() {
            renderCode(
              $("#recCode"),
              REC_CODE[currentLang][$("#recFn").value],
              -1,
            );
          }
          onLangChange(refreshRecCode);
          wireCopyButton("recCodeCopy", () =>
            REC_CODE[currentLang][$("#recFn").value].join("\n"),
          );

          function build() {
            idc = 0;
            const fn = $("#recFn").value,
              n = +$("#recN").value;
            root =
              fn === "factorial" ? buildFactTree(n, 0) : buildFibTree(n, 0);
            events = treeToEvents(root);
            player.setSteps(events);
            refreshRecCode();
            renderInfoGrid(
              $("#recInfo"),
              fn === "factorial"
                ? [
                    { k: "Time", v: "O(n)" },
                    { k: "Space (stack)", v: "O(n)" },
                  ]
                : [
                    { k: "Time (naive)", v: "O(2\u207F)" },
                    { k: "Space (stack)", v: "O(n)" },
                    { k: "Time (memoized)", v: "O(n)" },
                  ],
            );
          }

          $("#recN").addEventListener("input", () => {
            $("#recNVal").textContent = $("#recN").value;
          });
          $("#recFn").addEventListener("change", () => {
            const isFib = $("#recFn").value === "fibonacci";
            $("#recN").max = isFib ? 7 : 8;
            if (+$("#recN").value > +$("#recN").max) {
              $("#recN").value = $("#recN").max;
              $("#recNVal").textContent = $("#recN").value;
            }
          });
          $("#recBuild").addEventListener("click", build);
          $("#recSpeed").addEventListener("input", () =>
            player.setSpeed(1350 - +$("#recSpeed").value),
          );
          $("#recPlay").addEventListener("click", () => {
            if (!root) {
              build();
            }
            if (player.playing) player.pause();
            else player.play();
            $("#recPlay").textContent = player.playing ? "⏸ Pause" : "▶ Play";
          });
          $("#recStepFwd").addEventListener("click", () => {
            if (!root) build();
            player.pause();
            player.stepFwd();
            $("#recPlay").textContent = "▶ Play";
          });
          $("#recStepBack").addEventListener("click", () => {
            player.stepBack();
            $("#recPlay").textContent = "▶ Play";
          });
          $("#recReset").addEventListener("click", () => {
            player.reset();
            $("#recPlay").textContent = "▶ Play";
          });

          build();
        })();

        /* ============================================================
   PASTE YOUR CODE — auto-traced JS execution
   ============================================================ */
        (function () {
          let mode = "array"; // 'array' | 'narration'

          const BUBBLE_EXAMPLE = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        let tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  return arr;
}`;
          const BINARY_EXAMPLE = `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    let mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`;
          const FACT_EXAMPLE = `function factorial(n) {
  viz.note("factorial(" + n + ") called");
  if (n <= 1) {
    viz.note("base case reached, return 1");
    return 1;
  }
  const result = n * factorial(n - 1);
  viz.note("factorial(" + n + ") returns " + result);
  return result;
}`;

          function setMode(m) {
            mode = m;
            $("#ccModeArray").classList.toggle("active", m === "array");
            $("#ccModeNarration").classList.toggle("active", m === "narration");
            $("#ccArrayControls").classList.toggle("hidden", m !== "array");
            $("#ccNarrationControls").classList.toggle(
              "hidden",
              m !== "narration",
            );
          }
          function showError(msg) {
            const b = $("#ccError");
            b.textContent = msg;
            b.classList.remove("hidden");
          }
          function hideError() {
            $("#ccError").classList.add("hidden");
          }

          function renderCCArray(container, step) {
            container.innerHTML = "";
            if (!step.arr || step.arr.length === 0) {
              container.appendChild(
                el("div", { class: "empty-note" }, [
                  "No array to show for this step.",
                ]),
              );
              return;
            }
            const arr = step.arr,
              n = arr.length;
            const nums = arr.map((v) =>
              typeof v === "number" && isFinite(v) ? Math.abs(v) : 1,
            );
            const max = Math.max(...nums, 1);
            const wrapW = container.clientWidth || 640;
            const W = Math.max(wrapW, n * 34),
              H = 200,
              gap = 8;
            const barW = Math.max((W - gap * (n + 1)) / n, 14);
            const svg = svgEl("svg", {
              viewBox: `0 0 ${W} ${H}`,
              width: "100%",
              height: H,
              class: "array-svg",
            });
            arr.forEach((v, i) => {
              const numeric = typeof v === "number" && isFinite(v) ? v : 0;
              const h = (Math.abs(numeric) / max) * (H - 56);
              const x = gap + i * (barW + gap),
                y = H - 30 - h;
              let cls = "bar";
              if (step.compare.includes(i)) cls += " bar-compare";
              if (step.swap.includes(i)) cls += " bar-swap";
              svg.appendChild(
                svgEl("rect", {
                  x,
                  y,
                  width: barW,
                  height: Math.max(h, 2),
                  rx: 3,
                  class: cls,
                }),
              );
              if (barW > 16) {
                const lbl = svgEl("text", {
                  x: x + barW / 2,
                  y: H - 12,
                  class: "bar-label",
                  "text-anchor": "middle",
                });
                lbl.textContent = String(v);
                svg.appendChild(lbl);
              }
            });
            container.appendChild(svg);
          }

          function buildLog(steps) {
            const log = $("#ccLog");
            log.innerHTML = "";
            steps.forEach((s, i) => {
              log.appendChild(
                el("div", { class: "trace-row" }, [`${i + 1}. ${s.note}`]),
              );
            });
          }

          function traceCode(code, runMode, initialArr, extraArgs) {
            const events = [];
            const MAX_EVENTS = 3000;
            function pushEvent(e) {
              if (events.length >= MAX_EVENTS)
                throw new Error(
                  "Trace limit reached (3000 operations) — this may be looping forever, or try a smaller input.",
                );
              events.push(e);
            }
            const target = initialArr.slice();
            const proxy = new Proxy(target, {
              get(t, prop, recv) {
                const val = Reflect.get(t, prop, recv);
                if (typeof prop === "string" && /^\d+$/.test(prop))
                  pushEvent({ type: "read", index: +prop, arr: t.slice() });
                return val;
              },
              set(t, prop, value, recv) {
                const ok = Reflect.set(t, prop, value, recv);
                if (typeof prop === "string" && /^\d+$/.test(prop))
                  pushEvent({ type: "write", index: +prop, arr: t.slice() });
                return ok;
              },
            });
            const viz = {
              note(text) {
                pushEvent({
                  type: "note",
                  text: String(text),
                  arr: runMode === "array" ? target.slice() : null,
                });
              },
            };

            let fnName = null;
            let m = code.match(/function\s+([A-Za-z_$][\w$]*)\s*\(/);
            if (m) fnName = m[1];
            if (!fnName) {
              m = code.match(
                /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()/,
              );
              if (m) fnName = m[1];
            }
            if (!fnName)
              throw new Error(
                'Define a named function, e.g. "function mySort(arr) { ... }" — Slate calls it for you.',
              );

            let factory;
            try {
              factory = new Function(
                "viz",
                code +
                  `\nreturn typeof ${fnName} !== 'undefined' ? ${fnName} : undefined;`,
              );
            } catch (err) {
              throw new Error("Syntax error: " + err.message);
            }

            let fn;
            try {
              fn = factory(viz);
            } catch (err) {
              throw new Error(
                "Error while defining your function: " + err.message,
              );
            }
            if (typeof fn !== "function")
              throw new Error(
                'Could not find a function named "' + fnName + '".',
              );

            let result;
            try {
              result =
                runMode === "array"
                  ? fn(proxy, ...extraArgs)
                  : fn(...extraArgs);
            } catch (err) {
              throw new Error("Runtime error: " + err.message);
            }

            const steps = [];
            steps.push(
              runMode === "array"
                ? {
                    arr: initialArr.slice(),
                    compare: [],
                    swap: [],
                    note: "Starting trace with your input array.",
                  }
                : { arr: null, compare: [], swap: [], note: "Starting trace." },
            );

            events.forEach((e) => {
              if (e.type === "read")
                steps.push({
                  arr: e.arr,
                  compare: [e.index],
                  swap: [],
                  note: `Read arr[${e.index}] → ${e.arr[e.index]}`,
                });
              else if (e.type === "write")
                steps.push({
                  arr: e.arr,
                  compare: [],
                  swap: [e.index],
                  note: `Write arr[${e.index}] = ${e.arr[e.index]}`,
                });
              else if (e.type === "note")
                steps.push({ arr: e.arr, compare: [], swap: [], note: e.text });
            });

            const resultText =
              result === undefined
                ? "Finished — no return value."
                : "Returned: " + JSON.stringify(result);
            steps.push({
              arr: runMode === "array" ? target.slice() : null,
              compare: [],
              swap: [],
              note: resultText,
            });
            return { steps, resultText };
          }

          const player = makePlayer((step, idx, len) => {
            $("#ccProgress").textContent = `Step ${idx + 1} / ${len}`;
            $("#ccNarration").textContent =
              step.note || "(no note for this step)";
            $("#ccPlay").textContent = player.playing ? "⏸ Pause" : "▶ Play";
            if (step.arr) {
              $("#ccStageWrap").classList.remove("hidden");
              renderCCArray($("#ccSvgWrap"), step);
            } else {
              $("#ccStageWrap").classList.add("hidden");
            }
            const rows = $("#ccLog").querySelectorAll(".trace-row");
            rows.forEach((r, i) => r.classList.toggle("active", i === idx));
            if (rows[idx]) rows[idx].scrollIntoView({ block: "nearest" });
          });

          function parseArgs(raw) {
            raw = raw.trim();
            if (raw === "") return [];
            return raw.split(",").map((s) => {
              s = s.trim();
              try {
                return JSON.parse(s);
              } catch (e) {
                return s;
              }
            });
          }

          function runCode() {
            hideError();
            const code = $("#ccCode").value;
            if (!code.trim()) {
              showError("Paste some code first.");
              return;
            }
            let initialArr = [];
            if (mode === "array") {
              initialArr = $("#ccArray")
                .value.split(",")
                .map((s) => parseInt(s.trim(), 10))
                .filter((n) => !isNaN(n));
              if (initialArr.length === 0) {
                showError("Enter an initial array first, e.g. 8,3,9,1,5");
                return;
              }
              if (initialArr.length > 20) initialArr = initialArr.slice(0, 20);
            }
            const extraArgs = parseArgs(
              mode === "array" ? $("#ccExtra").value : $("#ccExtraOnly").value,
            );
            try {
              const { steps, resultText } = traceCode(
                code,
                mode,
                initialArr,
                extraArgs,
              );
              buildLog(steps);
              player.setSteps(steps);
              $("#ccResultLine").textContent = resultText;
            } catch (err) {
              showError(err.message || String(err));
              player.setSteps([]);
              $("#ccResultLine").textContent = "—";
              $("#ccLog").innerHTML = "";
            }
          }

          $("#ccModeArray").addEventListener("click", () => setMode("array"));
          $("#ccModeNarration").addEventListener("click", () =>
            setMode("narration"),
          );
          $("#ccExampleSort").addEventListener("click", () => {
            setMode("array");
            $("#ccCode").value = BUBBLE_EXAMPLE;
            $("#ccArray").value = "8,3,9,1,5,7";
            $("#ccExtra").value = "";
            hideError();
          });
          $("#ccExampleSearch").addEventListener("click", () => {
            setMode("array");
            $("#ccCode").value = BINARY_EXAMPLE;
            $("#ccArray").value = "1,3,5,7,9,11,13";
            $("#ccExtra").value = "9";
            hideError();
          });
          $("#ccExampleRec").addEventListener("click", () => {
            setMode("narration");
            $("#ccCode").value = FACT_EXAMPLE;
            $("#ccExtraOnly").value = "6";
            hideError();
          });
          $("#ccRun").addEventListener("click", runCode);
          $("#ccPlay").addEventListener("click", () => {
            if (player.playing) player.pause();
            else player.play();
            $("#ccPlay").textContent = player.playing ? "⏸ Pause" : "▶ Play";
          });
          $("#ccStepFwd").addEventListener("click", () => {
            player.pause();
            player.stepFwd();
            $("#ccPlay").textContent = "▶ Play";
          });
          $("#ccStepBack").addEventListener("click", () => {
            player.stepBack();
            $("#ccPlay").textContent = "▶ Play";
          });
          $("#ccReset").addEventListener("click", () => {
            player.reset();
            $("#ccPlay").textContent = "▶ Play";
          });

          setMode("array");
          $("#ccCode").value = BUBBLE_EXAMPLE;
          $("#ccArray").value = "8,3,9,1,5,7";
        })();

        /* ============================================================
   MEMORIZE — spaced repetition flashcards
   ============================================================ */
        (function () {
          const DECK = [
            {
              id: "bubble",
              cat: "Sorting",
              front: "Bubble Sort — time and space complexity?",
              back: "Time: O(n) best (already sorted), O(n\u00B2) average and worst.\nSpace: O(1).\nStable: yes.\n\nWhy: it makes repeated passes swapping adjacent out-of-order pairs.",
            },
            {
              id: "selection",
              cat: "Sorting",
              front: "Selection Sort — time and space complexity?",
              back: "Time: O(n\u00B2) in every case, even if already sorted.\nSpace: O(1).\nStable: no.\n\nWhy: it always scans the remaining unsorted part to find the minimum.",
            },
            {
              id: "insertion",
              cat: "Sorting",
              front: "Insertion Sort — time and space complexity?",
              back: "Time: O(n) best (nearly sorted), O(n\u00B2) average and worst.\nSpace: O(1).\nStable: yes.\n\nGood for small or nearly-sorted arrays.",
            },
            {
              id: "merge",
              cat: "Sorting",
              front: "Merge Sort — time and space complexity?",
              back: "Time: O(n log n) in every case.\nSpace: O(n) — needs extra arrays to merge into.\nStable: yes.\n\nSplits in half recursively, then merges sorted halves.",
            },
            {
              id: "quick",
              cat: "Sorting",
              front: "Quick Sort — time and space complexity?",
              back: "Time: O(n log n) average, O(n\u00B2) worst (e.g. already-sorted input with a bad pivot).\nSpace: O(log n) for the recursion stack.\nStable: no.\n\nPartitions around a pivot, then recurses on each side.",
            },
            {
              id: "sort-stable",
              cat: "Sorting",
              front: 'What does "stable" mean for a sort?',
              back: "Equal elements keep their original relative order after sorting.\nMatters when sorting by one key but wanting ties broken by original order (e.g. sort by score, ties stay in name order).",
            },
            {
              id: "quick-worst",
              cat: "Sorting",
              front: "Why is Quick Sort O(n\u00B2) in the worst case?",
              back: "If the pivot is always the smallest or largest element (e.g. picking the last element on an already-sorted array), one partition is empty and the other has n-1 elements every time — that's n recursive levels each doing O(n) work.",
            },
            {
              id: "linear-search",
              cat: "Searching",
              front: "Linear Search — time complexity?",
              back: "O(1) best, O(n) average and worst.\nWorks on any array, sorted or not.",
            },
            {
              id: "binary-search",
              cat: "Searching",
              front: "Binary Search — time complexity and requirement?",
              back: "O(log n) average and worst.\nRequires a sorted array.\nEach step halves the remaining search space.",
            },
            {
              id: "array-ops",
              cat: "Data structures",
              front: "Array — access, search, insert, delete?",
              back: "Access by index: O(1)\nSearch: O(n)\nInsert/delete at end: O(1) amortized\nInsert/delete at start or middle: O(n) — everything after must shift.",
            },
            {
              id: "stack-ops",
              cat: "Data structures",
              front: "Stack — push, pop, peek complexity?",
              back: "Push: O(1)\nPop: O(1)\nPeek: O(1)\nSearch: O(n)\n\nLIFO — last in, first out. Only the top is ever touched.",
            },
            {
              id: "queue-ops",
              cat: "Data structures",
              front: "Queue — enqueue, dequeue complexity?",
              back: "Enqueue: O(1)\nDequeue: O(1) with a proper implementation (ring buffer or two stacks)\nSearch: O(n)\n\nFIFO — first in, first out.",
            },
            {
              id: "ll-ops",
              cat: "Data structures",
              front: "Singly Linked List — insert at head vs tail?",
              back: "Insert at head: O(1) — just repoint the head pointer.\nInsert at tail (no tail pointer): O(n) — must walk the whole list.\nSearch / access by index: O(n) — no random access.",
            },
            {
              id: "bst-ops",
              cat: "Data structures",
              front: "Binary Search Tree — insert/search/delete complexity?",
              back: "Average (balanced): O(log n) for insert, search, and delete.\nWorst case (degenerates into a line, e.g. inserting sorted data): O(n).\nThat's exactly why self-balancing trees (AVL, red-black) exist.",
            },
            {
              id: "hash-ops",
              cat: "Data structures",
              front: "Hash Table — average vs worst case for lookup?",
              back: "Average: O(1) — the hash function spreads keys evenly across buckets.\nWorst case: O(n) — many keys collide into the same bucket (a bad hash function or adversarial input).",
            },
            {
              id: "graph-complexity",
              cat: "Data structures",
              front: "BFS / DFS complexity on a graph?",
              back: "Time: O(V + E) — every vertex and every edge is visited once.\nSpace: O(V) — for the visited set and the queue/stack.\nV = number of vertices, E = number of edges.",
            },
            {
              id: "bfs-vs-dfs",
              cat: "Concepts",
              front: "When would you reach for BFS instead of DFS?",
              back: 'BFS explores level by level using a queue — pick it when you need the shortest path in an unweighted graph, or the "closest" match first.\nDFS commits to one path using a stack (or recursion) — pick it for exploring all possibilities, detecting cycles, or when memory for a wide graph is a concern.',
            },
            {
              id: "recursion-space",
              cat: "Concepts",
              front:
                "Why does recursion use O(n) space even though it does no data structure work?",
              back: "Each recursive call adds a new frame to the call stack (return address, local variables, parameters), and that frame stays until the call returns. n nested calls means n frames alive at once.",
            },
            {
              id: "fib-naive",
              cat: "Concepts",
              front: "Why is naive recursive Fibonacci O(2\u207F)?",
              back: "fib(n) calls fib(n-1) and fib(n-2), and both branches keep re-deriving the same smaller subproblems from scratch — e.g. fib(2) gets recomputed exponentially many times. Memoizing (caching results) brings it down to O(n).",
            },
            {
              id: "amortized",
              cat: "Concepts",
              front:
                'What does "amortized O(1)" mean, e.g. for a dynamic array\'s push?',
              back: "Most pushes are O(1), but occasionally the array must resize and copy everything — O(n) for that one call.\nSpread that occasional O(n) cost across all the pushes since the last resize, and the average per push is still O(1).",
            },
            {
              id: "space-time",
              cat: "Concepts",
              front:
                'What is the classic "space vs time" trade-off, in one example?',
              back: "Hashing/memoization: spend extra memory (a cache or hash table) to avoid repeating expensive work — e.g. memoized Fibonacci trades O(n) space for dropping time from O(2\u207F) to O(n).",
            },
            {
              id: "divide-conquer",
              cat: "Concepts",
              front:
                'What makes Merge Sort and Quick Sort "divide and conquer"?',
              back: "Both break the problem into smaller subproblems of the same shape (sorting smaller arrays), solve those recursively, then combine the results — merge the halves, or simply concatenate already-in-place partitions.",
            },
            {
              id: "inorder-bst",
              cat: "Concepts",
              front:
                "Why does an in-order traversal of a BST visit values in sorted order?",
              back: "In-order visits left subtree, then the node, then right subtree. In a BST, everything in the left subtree is smaller and everything in the right subtree is larger than the current node — so visiting left-root-right naturally walks values from smallest to largest.",
            },
          ];

          let progress = {};
          let sessionQueue = [];
          let currentCard = null;
          let flipped = false;
          let activeCat = "All";

          function isDue(state) {
            if (!state) return true;
            return new Date(state.due).getTime() <= Date.now();
          }
          function isMastered(state) {
            return state && state.reps >= 3 && state.interval >= 14;
          }

          async function loadProgress() {
            try {
              const response = await fetch("/api/progress");
              if (response.ok) {
                const data = await response.json();
                progress = data.progress || {};
              } else {
                progress = JSON.parse(localStorage.getItem("slate-flashcard-progress") || "{}");
              }
            } catch (e) {
              try { progress = JSON.parse(localStorage.getItem("slate-flashcard-progress") || "{}"); }
              catch (_) { progress = {}; }
            }
            refreshStats();
          }
          async function saveProgress() {
            try {
              localStorage.setItem("slate-flashcard-progress", JSON.stringify(progress));
              await fetch("/api/progress", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ progress })
              });
            } catch (e) {
              console.error("Could not save memorize progress", e);
            }
          }

          function refreshStats() {
            let due = 0,
              learning = 0,
              mastered = 0;
            DECK.forEach((c) => {
              const s = progress[c.id];
              if (isMastered(s)) mastered++;
              else if (s) learning++;
              if (isDue(s)) due++;
            });
            $("#memDue").textContent = due;
            $("#memLearning").textContent = learning;
            $("#memMastered").textContent = mastered;
            $("#memTotal").textContent = DECK.length;
          }

          function renderCats() {
            const cats = ["All", ...new Set(DECK.map((c) => c.cat))];
            const row = $("#memCats");
            row.innerHTML = "";
            cats.forEach((c) => {
              const chip = el(
                "button",
                { class: "cat-chip" + (c === activeCat ? " active" : "") },
                [c],
              );
              chip.addEventListener("click", () => {
                activeCat = c;
                renderCats();
                startSession();
              });
              row.appendChild(chip);
            });
          }

          function deckForCat() {
            return activeCat === "All"
              ? DECK
              : DECK.filter((c) => c.cat === activeCat);
          }

          function startSession() {
            const pool = deckForCat();
            let due = pool.filter((c) => isDue(progress[c.id]));
            if (due.length === 0) due = pool.slice();
            sessionQueue = due.slice().sort(() => Math.random() - 0.5);
            nextCard();
          }

          function nextCard() {
            flipped = false;
            if (sessionQueue.length === 0) {
              renderEmpty();
              return;
            }
            currentCard = sessionQueue.shift();
            renderCard();
          }

          function renderEmpty() {
            const area = $("#memArea");
            area.innerHTML = "";
            area.appendChild(
              el("div", { class: "mem-done" }, [
                el("h3", {}, ["All caught up for now"]),
                el("p", { style: "margin-top:8px;" }, [
                  "Nothing left due in this category. Come back later, or switch categories above.",
                ]),
              ]),
            );
          }

          function renderCard() {
            const area = $("#memArea");
            area.innerHTML = "";
            const scene = el("div", { class: "card-scene" });
            const card = el("div", {
              class: "flashcard" + (flipped ? " flipped" : ""),
            });
            const front = el("div", { class: "face front" }, [
              el("div", { class: "eyebrow" }, [currentCard.cat]),
              el("div", { class: "txt" }, [currentCard.front]),
            ]);
            const back = el("div", { class: "face back" }, [
              el("div", { class: "eyebrow" }, ["ANSWER"]),
              el("div", { class: "txt" }, [currentCard.back]),
            ]);
            card.appendChild(front);
            card.appendChild(back);
            card.addEventListener("click", () => {
              flipped = !flipped;
              card.classList.toggle("flipped");
              renderHint();
            });
            scene.appendChild(card);
            area.appendChild(scene);
            area.appendChild(
              el("div", { class: "flip-hint", id: "memHint" }, [
                flipped ? "" : "Click the card to reveal the answer",
              ]),
            );
            if (flipped) renderRateRow(area);
          }
          function renderHint() {
            const hint = $("#memHint");
            if (!hint) return;
            hint.textContent = flipped
              ? ""
              : "Click the card to reveal the answer";
            if (flipped) {
              const area = $("#memArea");
              if (!$(".rate-row")) renderRateRow(area);
            } else {
              const rr = $(".rate-row");
              if (rr) rr.remove();
            }
          }
          function renderRateRow(area) {
            const old = $(".rate-row");
            if (old) old.remove();
            const row = el("div", { class: "rate-row" });
            const ratings = [
              { label: "Again", cls: "rate-again", q: 0 },
              { label: "Hard", cls: "rate-hard", q: 3 },
              { label: "Good", cls: "rate-good", q: 4 },
              { label: "Easy", cls: "rate-easy", q: 5 },
            ];
            ratings.forEach((r) => {
              const btn = el("button", { class: "rate-btn " + r.cls }, [
                r.label,
              ]);
              btn.addEventListener("click", (ev) => {
                ev.stopPropagation();
                rate(currentCard, r.q);
              });
              row.appendChild(btn);
            });
            area.appendChild(row);
          }

          function rate(card, quality) {
            let state = progress[card.id] || {
              ef: 2.5,
              reps: 0,
              interval: 0,
              due: Date.now(),
            };
            if (quality < 3) {
              state.reps = 0;
              state.interval = 1;
              sessionQueue.push(card);
            } else {
              if (state.reps === 0) state.interval = 1;
              else if (state.reps === 1) state.interval = 6;
              else state.interval = Math.round(state.interval * state.ef);
              state.reps += 1;
            }
            state.ef = Math.max(
              1.3,
              state.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
            );
            const due = new Date();
            if (quality < 3) {
              due.setMinutes(due.getMinutes() + 1);
            } else {
              due.setDate(due.getDate() + state.interval);
            }
            state.due = due.getTime();
            progress[card.id] = state;
            saveProgress();
            refreshStats();
            nextCard();
          }

          $("#memResetProgress").addEventListener("click", () => {
            progress = {};
            saveProgress();
            refreshStats();
            startSession();
          });

          renderCats();
          loadProgress().then(startSession);
        })();
      })();
