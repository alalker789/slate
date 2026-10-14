export const appMarkup = `<div class="app">
  <header class="board-header">
    <a href="/" class="brand" aria-label="Slate home" style="text-decoration: none; color: inherit;">
      <h1>Slate<span class="dot">.</span></h1>
      <p>
        Watch algorithms think, one step at a time — then use the built-in
        flashcards to make them stick for good.
      </p>
    </a>

    <div class="legend" id="legend">
      <div class="legend-item">
        <span class="legend-swatch" style="background: var(--yellow)"></span>
        comparing
      </div>
      <div class="legend-item">
        <span class="legend-swatch" style="background: var(--pink)"></span>
        swap / write
      </div>
      <div class="legend-item">
        <span class="legend-swatch" style="background: var(--cyan)"></span>
        visiting / pivot
      </div>
      <div class="legend-item">
        <span class="legend-swatch" style="background: var(--mint)"></span>
        done / sorted
      </div>
    </div>
  </header>

  <div class="lang-bar">
    <span class="lang-label">Show code in</span>
    <div class="lang-chips" id="langChips">
      <button class="cat-chip active" data-lang="pseudo">Pseudocode</button>
      <button class="cat-chip" data-lang="c">C</button>
      <button class="cat-chip" data-lang="cpp">C++</button>
      <button class="cat-chip" data-lang="java">Java</button>
    </div>
  </div>

  <div class="layout">
    <nav class="index" id="nav">
      <button data-panel="sorting" class="active">Sorting</button>
      <button data-panel="searching">Searching</button>
      <button data-panel="stackqueue">Stack &amp; Queue</button>
      <button data-panel="linkedlist">Linked List</button>
      <button data-panel="tree">Binary Search Tree</button>
      <button data-panel="graph">Graph Traversal</button>
      <button data-panel="recursion">Recursion</button>
      <button data-panel="customcode">Paste Your Code</button>
      <button data-panel="memorize">Memorize</button>

      <div class="index-note">
        Pick a topic. Every visualizer uses the same colour language above,
        so the pattern carries over as you move between them.
      </div>
    </nav>

    <main class="board" id="board">

      <!-- ================= SORTING ================= -->
      <section class="panel active" data-panel="sorting">
        <div class="panel-head">
          <h2>Sorting algorithms</h2>
          <p>
            Step through five classic sorts on the same array so you can
            compare how each one earns its keep.
          </p>
        </div>

        <div class="controls">
          <label>
            Algorithm
            <select id="sortAlgo">
              <option value="bubble">Bubble Sort</option>
              <option value="selection">Selection Sort</option>
              <option value="insertion">Insertion Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="quick">Quick Sort</option>
            </select>
          </label>

          <label>
            Array size
            <input type="range" id="sortSize" min="6" max="24" value="12" />
          </label>

          <label>
            Speed
            <input
              type="range"
              id="sortSpeed"
              min="80"
              max="1000"
              value="450"
              step="10"
            />
          </label>

          <label>
            Custom array
            <div class="btn-row">
              <input
                class="txt"
                id="sortCustom"
                placeholder="e.g. 8,3,9,1,5"
                style="width: 150px"
              />
              <button class="btn" id="sortApplyCustom">Apply</button>
            </div>
          </label>

          <button class="btn" id="sortShuffle">Shuffle new array</button>
        </div>

        <div class="stage">
          <div id="sortSvgWrap"></div>
        </div>

        <div class="progress-line">
          <span id="sortProgress">Step 0 / 0</span>
          <span id="sortAlgoName">Bubble Sort</span>
        </div>

        <div class="narration" id="sortNarration">
          Press play or step forward to begin.
        </div>

        <div class="btn-row" style="margin-bottom: 16px">
          <button class="btn" id="sortStepBack">◀ Step</button>
          <button class="btn primary" id="sortPlay">▶ Play</button>
          <button class="btn" id="sortStepFwd">Step ▶</button>
          <button class="btn ghost" id="sortReset">Reset</button>
        </div>

        <div class="two-col">
          <div class="code-card">
            <div class="code-card-head">
              <div class="code-title">CODE</div>
              <button class="copy-btn" id="sortCodeCopy">Copy</button>
            </div>
            <div id="sortCode"></div>
          </div>

          <div class="card">
            <h4
              style="
                font-size: 13px;
                color: var(--ink-dim);
                margin-bottom: 2px;
              "
            >
              Complexity
            </h4>
            <div class="info-grid" id="sortInfo"></div>
          </div>
        </div>
      </section>

      <!-- ================= SEARCHING ================= -->
      <section class="panel" data-panel="searching">
        <div class="panel-head">
          <h2>Searching algorithms</h2>
          <p>
            Linear search checks everything; binary search throws half away
            each time — but only once the array is sorted.
          </p>
        </div>

        <div class="controls">
          <label>
            Algorithm
            <select id="searchAlgo">
              <option value="linear">Linear Search</option>
              <option value="binary">Binary Search</option>
            </select>
          </label>

          <label>
            Array size
            <input
              type="range"
              id="searchSize"
              min="6"
              max="24"
              value="12"
            />
          </label>

          <label>
            Speed
            <input
              type="range"
              id="searchSpeed"
              min="80"
              max="1000"
              value="450"
              step="10"
            />
          </label>

          <label>
            Target value
            <input
              class="txt"
              id="searchTarget"
              style="width: 80px"
              type="number"
            />
          </label>

          <button class="btn" id="searchShuffle">Shuffle new array</button>
        </div>

        <div class="stage">
          <div id="searchSvgWrap"></div>
        </div>

        <div class="progress-line">
          <span id="searchProgress">Step 0 / 0</span>
          <span id="searchAlgoName">Linear Search</span>
        </div>

        <div class="narration" id="searchNarration">
          Press play or step forward to begin.
        </div>

        <div class="btn-row" style="margin-bottom: 16px">
          <button class="btn" id="searchStepBack">◀ Step</button>
          <button class="btn primary" id="searchPlay">▶ Play</button>
          <button class="btn" id="searchStepFwd">Step ▶</button>
          <button class="btn ghost" id="searchReset">Reset</button>
        </div>

        <div class="two-col">
          <div class="code-card">
            <div class="code-card-head">
              <div class="code-title">CODE</div>
              <button class="copy-btn" id="searchCodeCopy">Copy</button>
            </div>
            <div id="searchCode"></div>
          </div>

          <div class="card">
            <h4
              style="
                font-size: 13px;
                color: var(--ink-dim);
                margin-bottom: 2px;
              "
            >
              Complexity
            </h4>
            <div class="info-grid" id="searchInfo"></div>
          </div>
        </div>
      </section>

      <!-- ================= STACK & QUEUE ================= -->
      <section class="panel" data-panel="stackqueue">
        <div class="panel-head">
          <h2>Stack &amp; Queue</h2>
          <p>
            Two ways to line things up: last in, first out — or first in,
            first out.
          </p>
        </div>

        <div class="struct-toggle">
          <button class="btn active" id="sqStackBtn">Stack (LIFO)</button>
          <button class="btn" id="sqQueueBtn">Queue (FIFO)</button>
        </div>

        <div class="controls">
          <label>
            Value
            <input
              class="txt"
              id="sqValue"
              style="width: 100px"
              placeholder="e.g. 7"
            />
          </label>

          <div class="btn-row" id="sqOps" style="align-self: flex-end"></div>
          <button class="btn ghost" id="sqClear">Clear</button>
        </div>

        <div class="stage">
          <div id="sqStage"></div>
        </div>

        <div class="narration" id="sqNarration">
          Push a value to get started.
        </div>

        <div class="two-col">
          <div class="code-card">
            <div class="code-card-head">
              <div class="code-title">HOW IT WORKS</div>
              <button class="copy-btn" id="sqCodeCopy">Copy</button>
            </div>
            <div id="sqCode"></div>
          </div>

          <div class="card">
            <h4
              style="
                font-size: 13px;
                color: var(--ink-dim);
                margin-bottom: 2px;
              "
            >
              Complexity
            </h4>
            <div class="info-grid" id="sqInfo"></div>
          </div>
        </div>
      </section>

      <!-- ================= LINKED LIST ================= -->
      <section class="panel" data-panel="linkedlist">
        <div class="panel-head">
          <h2>Singly linked list</h2>
          <p>
            Each node only knows what comes next — insertion at the head is
            free, but finding anything means walking the chain.
          </p>
        </div>

        <div class="controls">
          <label>
            Value
            <input
              class="txt"
              id="llValue"
              style="width: 90px"
              placeholder="e.g. 4"
            />
          </label>

          <label>
            Index (for insert/delete at)
            <input
              class="txt"
              id="llIndex"
              style="width: 70px"
              type="number"
              min="0"
            />
          </label>

          <button class="btn" id="llInsertHead">Insert at head</button>
          <button class="btn" id="llInsertTail">Insert at tail</button>
          <button class="btn" id="llInsertAt">Insert at index</button>
          <button class="btn" id="llDelete">Delete value</button>
          <button class="btn" id="llSearch">Search value</button>
          <button class="btn ghost" id="llClear">Clear</button>
        </div>

        <div class="stage">
          <div id="llStage" class="ll-stage"></div>
        </div>

        <div class="narration" id="llNarration">
          Insert a value to build your first node.
        </div>

        <div class="two-col">
          <div class="code-card">
            <div class="code-card-head">
              <div class="code-title">NODE STRUCTURE</div>
              <button class="copy-btn" id="llCodeCopy">Copy</button>
            </div>
            <div id="llCode"></div>
          </div>

          <div class="card">
            <h4
              style="
                font-size: 13px;
                color: var(--ink-dim);
                margin-bottom: 2px;
              "
            >
              Complexity
            </h4>
            <div class="info-grid" id="llInfo"></div>
          </div>
        </div>
      </section>

      <!-- ================= TREE ================= -->
      <section class="panel" data-panel="tree">
        <div class="panel-head">
          <h2>Binary search tree</h2>
          <p>
            Smaller goes left, bigger goes right. Traversal order changes
            entirely based on when you visit a node.
          </p>
        </div>

        <div class="controls">
          <label>
            Value
            <input
              class="txt"
              id="treeValue"
              style="width: 90px"
              placeholder="e.g. 12"
            />
          </label>

          <button class="btn" id="treeInsert">Insert</button>
          <button class="btn" id="treeRandom">Random tree</button>
          <button class="btn ghost" id="treeClear">Clear</button>

          <label>
            Traversal
            <select id="treeTraversal">
              <option value="inorder">In-order (L, root, R)</option>
              <option value="preorder">Pre-order (root, L, R)</option>
              <option value="postorder">Post-order (L, R, root)</option>
              <option value="levelorder">Level-order (BFS)</option>
            </select>
          </label>

          <label>
            Speed
            <input
              type="range"
              id="treeSpeed"
              min="150"
              max="1200"
              value="600"
              step="10"
            />
          </label>
        </div>

        <div class="stage">
          <div id="treeSvgWrap"></div>
        </div>

        <div class="progress-line">
          <span id="treeProgress">Step 0 / 0</span>
          <span>Visit order: <span id="treeResult">—</span></span>
        </div>

        <div class="narration" id="treeNarration">
          Insert a few values, then run a traversal.
        </div>

        <div class="btn-row" style="margin-bottom: 16px">
          <button class="btn" id="treeStepBack">◀ Step</button>
          <button class="btn primary" id="treePlay">▶ Traverse</button>
          <button class="btn" id="treeStepFwd">Step ▶</button>
          <button class="btn ghost" id="treeReset">Reset</button>
        </div>

        <div class="two-col">
          <div class="code-card">
            <div class="code-card-head">
              <div class="code-title">CODE — CURRENT TRAVERSAL</div>
              <button class="copy-btn" id="treeCodeCopy">Copy</button>
            </div>
            <div id="treeCode"></div>
          </div>

          <div class="card">
            <h4
              style="
                font-size: 13px;
                color: var(--ink-dim);
                margin-bottom: 2px;
              "
            >
              Complexity (balanced / worst case)
            </h4>
            <div class="info-grid" id="treeInfo"></div>
          </div>
        </div>
      </section>

      <!-- ================= GRAPH ================= -->
      <section class="panel" data-panel="graph">
        <div class="panel-head">
          <h2>Graph traversal</h2>
          <p>
            Breadth-first spreads out level by level with a queue;
            depth-first commits to a path with a stack.
          </p>
        </div>

        <div class="controls">
          <label>
            Algorithm
            <select id="graphAlgo">
              <option value="bfs">Breadth-first search</option>
              <option value="dfs">Depth-first search</option>
            </select>
          </label>

          <label>
            Start node
            <select id="graphStart"></select>
          </label>

          <label>
            Add edge
            <div class="btn-row">
              <input
                class="txt"
                id="graphEdge"
                style="width: 80px"
                placeholder="A-D"
              />
              <button class="btn" id="graphAddEdge">Add</button>
            </div>
          </label>

          <button class="btn ghost" id="graphResetGraph">Reset graph</button>

          <label>
            Speed
            <input
              type="range"
              id="graphSpeed"
              min="150"
              max="1200"
              value="600"
              step="10"
            />
          </label>
        </div>

        <div class="stage">
          <div id="graphSvgWrap"></div>
        </div>

        <div class="progress-line">
          <span id="graphProgress">Step 0 / 0</span>
          <span>Frontier: <span id="graphFrontier">—</span></span>
        </div>

        <div class="narration" id="graphNarration">
          Pick a start node and press traverse.
        </div>

        <div class="btn-row" style="margin-bottom: 16px">
          <button class="btn" id="graphStepBack">◀ Step</button>
          <button class="btn primary" id="graphPlay">▶ Traverse</button>
          <button class="btn" id="graphStepFwd">Step ▶</button>
          <button class="btn ghost" id="graphReset">Reset</button>
        </div>

        <div class="two-col">
          <div class="code-card">
            <div class="code-card-head">
              <div class="code-title">CODE — CURRENT ALGORITHM</div>
              <button class="copy-btn" id="graphCodeCopy">Copy</button>
            </div>
            <div id="graphCode"></div>
          </div>

          <div class="card">
            <h4
              style="
                font-size: 13px;
                color: var(--ink-dim);
                margin-bottom: 2px;
              "
            >
              Complexity
            </h4>
            <div class="info-grid" id="graphInfo"></div>
          </div>
        </div>
      </section>

      <!-- ================= RECURSION ================= -->
      <section class="panel" data-panel="recursion">
        <div class="panel-head">
          <h2>Recursion &amp; the call stack</h2>
          <p>
            Every recursive call waits on a stack until its children return
            — watch the tree and the stack move together.
          </p>
        </div>

        <div class="controls">
          <label>
            Function
            <select id="recFn">
              <option value="factorial">factorial(n)</option>
              <option value="fibonacci">fibonacci(n)</option>
            </select>
          </label>

          <label>
            n
            <input type="range" id="recN" min="2" max="8" value="5" />
            <span
              id="recNVal"
              style="font-family: var(--font-mono); font-size: 12px"
            >5</span>
          </label>

          <label>
            Speed
            <input
              type="range"
              id="recSpeed"
              min="150"
              max="1200"
              value="550"
              step="10"
            />
          </label>

          <button class="btn" id="recBuild">Build call tree</button>
        </div>

        <div class="two-col">
          <div class="stage" style="margin-bottom: 0">
            <div id="recSvgWrap"></div>
          </div>

          <div class="card">
            <h4
              style="
                font-size: 13px;
                color: var(--ink-dim);
                margin-bottom: 8px;
              "
            >
              Call stack (top = most recent)
            </h4>

            <div
              id="recStack"
              style="
                display: flex;
                flex-direction: column-reverse;
                gap: 5px;
                min-height: 160px;
              "
            ></div>
          </div>
        </div>

        <div class="progress-line" style="margin-top: 12px">
          <span id="recProgress">Step 0 / 0</span>
          <span id="recResultLine">—</span>
        </div>

        <div class="narration" id="recNarration">
          Choose n and build the call tree to begin.
        </div>

        <div class="btn-row" style="margin-bottom: 16px">
          <button class="btn" id="recStepBack">◀ Step</button>
          <button class="btn primary" id="recPlay">▶ Play</button>
          <button class="btn" id="recStepFwd">Step ▶</button>
          <button class="btn ghost" id="recReset">Reset</button>
        </div>

        <div class="two-col">
          <div class="code-card">
            <div class="code-card-head">
              <div class="code-title">CODE — CURRENT FUNCTION</div>
              <button class="copy-btn" id="recCodeCopy">Copy</button>
            </div>
            <div id="recCode"></div>
          </div>

          <div class="card">
            <h4
              style="
                font-size: 13px;
                color: var(--ink-dim);
                margin-bottom: 2px;
              "
            >
              Complexity
            </h4>
            <div class="info-grid" id="recInfo"></div>
          </div>
        </div>
      </section>

      <!-- ================= PASTE YOUR CODE ================= -->
      <section class="panel" data-panel="customcode">
        <div class="panel-head">
          <h2>Paste your own code</h2>

          <p>
            Write a JavaScript function. In <b>array trace</b> mode Slate
            watches every read and write to your array automatically — no
            annotations needed. In <b>custom narration</b> mode, call
            <code>viz.note("text")</code> anywhere in your code (great for
            recursion or non-array logic) and Slate turns those into a
            step-through trace.
          </p>

          <p style="margin-top: 8px">
            This live tracer only understands JavaScript — running C, C++,
            or Java would need a real compiler on a server, which this page
            doesn't have. If you write in one of those languages, use the
            <b>"Show code in"</b> switcher near the top of the page to see
            and copy correct C / C++ / Java implementations for every
            built-in visualizer above.
          </p>
        </div>

        <div class="controls">
          <div class="struct-toggle">
            <button class="btn active" id="ccModeArray">Array trace</button>
            <button class="btn" id="ccModeNarration">
              Custom narration
            </button>
          </div>
        </div>

        <div class="controls" id="ccArrayControls">
          <label>
            Initial array
            <input
              class="txt"
              id="ccArray"
              style="width: 190px"
              placeholder="e.g. 8,3,9,1,5"
            />
          </label>

          <label>
            Extra arguments
            <span style="color: var(--ink-faint)">
              (comma-separated, optional)
            </span>
            <input
              class="txt"
              id="ccExtra"
              style="width: 140px"
              placeholder="e.g. 5"
            />
          </label>
        </div>

        <div class="controls hidden" id="ccNarrationControls">
          <label>
            Arguments
            <span style="color: var(--ink-faint)">(comma-separated)</span>
            <input
              class="txt"
              id="ccExtraOnly"
              style="width: 190px"
              placeholder="e.g. 6"
            />
          </label>
        </div>

        <textarea
          class="code-input"
          id="ccCode"
          spellcheck="false"
        ></textarea>

        <div class="btn-row" style="margin: 12px 0; flex-wrap: wrap">
          <button class="btn" id="ccExampleSort">
            Bubble sort example
          </button>
          <button class="btn" id="ccExampleSearch">
            Binary search example
          </button>
          <button class="btn" id="ccExampleRec">
            Recursive factorial example
          </button>
          <button class="btn primary" id="ccRun" style="margin-left: auto">
            Run &amp; visualize
          </button>
        </div>

        <div class="error-banner hidden" id="ccError"></div>

        <div class="stage" id="ccStageWrap">
          <div id="ccSvgWrap"></div>
        </div>

        <div class="progress-line">
          <span id="ccProgress">Step 0 / 0</span>
          <span id="ccResultLine">—</span>
        </div>

        <div class="narration" id="ccNarration">
          Paste code (or try an example above) and press Run &amp;
          visualize.
        </div>

        <div class="btn-row" style="margin-bottom: 16px">
          <button class="btn" id="ccStepBack">◀ Step</button>
          <button class="btn primary" id="ccPlay">▶ Play</button>
          <button class="btn" id="ccStepFwd">Step ▶</button>
          <button class="btn ghost" id="ccReset">Reset</button>
        </div>

        <div class="card">
          <h4
            style="
              font-size: 13px;
              color: var(--ink-dim);
              margin-bottom: 8px;
            "
          >
            Trace log
          </h4>
          <div class="trace-log" id="ccLog"></div>
        </div>

        <p
          style="
            color: var(--ink-faint);
            font-size: 12px;
            margin-top: 14px;
            line-height: 1.65;
          "
        >
          Runs directly in your browser — only paste code you wrote or
          trust, the same way you'd treat any code snippet you run locally.
          A runaway loop can freeze the tab (reload if that happens); traces
          are also capped at a few thousand steps as a safety net.
        </p>
      </section>

      <!-- ================= MEMORIZE ================= -->
      <section class="panel" data-panel="memorize">
        <div class="panel-head">
          <h2>Memorize</h2>
          <p>
            Spaced-repetition flashcards for everything above. Rate each
            card honestly — easy cards come back in weeks, hard ones come
            back tomorrow.
          </p>
        </div>

        <div class="mem-stats">
          <div class="mem-stat">
            <div class="n" id="memDue">0</div>
            <div class="l">due now</div>
          </div>

          <div class="mem-stat">
            <div class="n" id="memLearning">0</div>
            <div class="l">learning</div>
          </div>

          <div class="mem-stat">
            <div class="n" id="memMastered">0</div>
            <div class="l">mastered</div>
          </div>

          <div class="mem-stat">
            <div class="n" id="memTotal">0</div>
            <div class="l">total cards</div>
          </div>
        </div>

        <div class="cat-row" id="memCats"></div>
        <div id="memArea"></div>

        <button class="mem-reset" id="memResetProgress">
          Reset all memorize progress
        </button>
      </section>
    </main>
  </div>

  <footer class="tip">
    Built for learning, not benchmarking — arrays are kept small on purpose
    so every step stays visible.
  </footer>
</div>`;
