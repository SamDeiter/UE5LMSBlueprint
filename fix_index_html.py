
html_content = """<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blueprint Editor (UE5 Replica)</title>

    <!-- Prevent caching during development -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico">
    <meta http-equiv="Expires" content="0">

    <!-- Google Font (Inter) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <!-- External Stylesheet -->
    <!-- Modular CSS Files -->
    <link rel="stylesheet" href="src/css/variables.css?v=20251128">
    <link rel="stylesheet" href="src/css/reset.css?v=20251128">
    <link rel="stylesheet" href="src/css/layout.css?v=20251128">
    <link rel="stylesheet" href="src/css/ui-elements.css?v=20251128">
    <link rel="stylesheet" href="src/css/nodes.css?v=20251128">
    <link rel="stylesheet" href="src/css/graph.css?v=20251128">
    <link rel="stylesheet" href="src/css/panels.css?v=20251128">
    <link rel="stylesheet" href="src/css/modals.css?v=20251128">
</head>

<body>
    <div id="app-container">
        <div id="menubar" class="menubar">
            <div class="menu-left">
                <img src="assets/icons/ue-logo.svg" alt="UE Logo" class="ue-logo-icon">
                <div class="menu-item dropdown-menu">
                    File
                    <div class="dropdown-content">
                        <div class="dropdown-item" id="new-blueprint-menu-item">
                            <i class="fas fa-file"></i> New Blueprint
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" id="save-blueprint-menu-item">
                            <i class="fas fa-save"></i> Save
                        </div>
                    </div>
                </div>
                <div class="menu-item">Edit</div>
                <div class="menu-item">Asset</div>
                <div class="menu-item">View</div>
                <div class="menu-item">Debug</div>
                <div class="menu-item">Window</div>
                <div class="menu-item">Tools</div>
                <div class="menu-item">Help</div>
            </div>
            <div class="menu-right">
                <div id="app-version" style="color: #666; font-size: 11px; margin-right: 15px; opacity: 0.7;">v1.0.0</div>
                <div class="window-controls">
                    <i class="fas fa-minus"></i>
                    <i class="far fa-square"></i>
                    <i class="fas fa-times"></i>
                </div>
            </div>
        </div>

        <!-- TAB BAR -->
        <div id="tabbar" class="tabbar">
            <div class="tab graph-tab active" data-graph="EventGraph">
                <i class="fas fa-file-code" style="color: #4a90e2; margin-right: 6px;"></i>
                <span>Event Graph</span>
                <i class="fas fa-times tab-close"></i>
            </div>
        </div>

        <!-- TOOLBAR -->
        <div id="toolbar">
            <div class="group">
                <button id="compile-btn" title="Compile (F7)">
                    <i class="fas fa-check-square"></i> Compile
                </button>
                <button id="save-btn" title="Save (Ctrl+S)">
                    <i class="fas fa-save"></i> Save
                </button>
                <button id="browse-btn" title="Browse">
                    <i class="fas fa-search"></i> Browse
                </button>
            </div>

            <div class="group">
                <button id="undo-btn" title="Undo (Ctrl+Z)">
                    <i class="fas fa-undo"></i>
                </button>
                <button id="redo-btn" title="Redo (Ctrl+Y)">
                    <i class="fas fa-redo"></i>
                </button>
            </div>

            <div class="group">
                <button id="play-btn" title="Play">
                    <i class="fas fa-play" style="color: #4caf50;"></i>
                </button>
                <button id="stop-btn" title="Stop">
                    <i class="fas fa-stop" style="color: #f44336;"></i>
                </button>
                <button id="step-btn" title="Step Over">
                    <i class="fas fa-step-forward"></i>
                </button>
                <button id="step-into-btn" title="Step Into">
                    <i class="fas fa-indent"></i>
                </button>
                <button id="step-out-btn" title="Step Out">
                    <i class="fas fa-outdent"></i>
                </button>
            </div>

            <div class="group">
                <label for="task-selector" style="color: #ccc; margin-right: 8px; font-size: 12px;">Task:</label>
                <select id="task-selector"
                    style="background: #2a2a2a; color: #ccc; border: 1px solid #444; padding: 4px 8px; border-radius: 2px; min-width: 200px;">
                    <option value="">Select Task...</option>
                </select>
            </div>

            <div class="group" style="margin-left: auto;">
                <button id="class-defaults-btn" title="Class Defaults">
                    <i class="fas fa-cog"></i> Class Defaults
                </button>
                <button id="help-btn" title="Help">
                    <i class="fas fa-question-circle"></i>
                </button>
            </div>
            <div class="parent-class-label" style="margin-left: 10px;">Parent class: <a href="#">Actor</a></div>
        </div>

        <div id="left-panel" class="panel">
            <div id="left-sidebar-tabs">
                <div id="components-panel">
                    <div class="panel-header">
                        <i class="fas fa-cube" style="margin-right: 6px; font-size: 10px; opacity: 0.7;"></i>
                        <span>Components</span>
                        <i class="fas fa-times"
                            style="margin-left: auto; font-size: 10px; color: #666; cursor: pointer;"></i>
                    </div>
                    <div class="panel-toolbar">
                        <button class="btn-green-add">
                            <i class="fas fa-plus"></i> <span style="margin-left: 4px;">Add</span>
                        </button>
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="Search">
                        </div>
                    </div>
                    <div class="panel-content" style="padding: 0;">
                        <div class="tree-item">
                            <i class="fas fa-dot-circle" style="margin-right: 8px; color: #ccc;"></i>
                            <span>NewBlueprint (Self)</span>
                        </div>
                        <div class="tree-item" style="padding-left: 24px;">
                            <i class="fas fa-location-arrow"
                                style="margin-right: 8px; color: #ccc; transform: rotate(-45deg);"></i>
                            <span>DefaultSceneRoot</span>
                        </div>
                    </div>
                </div>
                <!-- MY BLUEPRINT -->
                <div id="my-blueprint">
                    <div class="panel-header">
                        <i class="fas fa-book" style="margin-right: 6px; font-size: 10px; opacity: 0.7;"></i>
                        <span>My Blueprint</span>
                        <i class="fas fa-times"
                            style="margin-left: auto; font-size: 10px; color: #666; cursor: pointer;"></i>
                    </div>
                    <!-- Controls are now inside the tree sections via JS -->
                    <div id="new-var-input-container" style="display: none;">
                        <input type="text" id="new-var-name" placeholder="NewVariable" value="NewVariable">
                        <select id="new-var-type">
                            <option value="bool">Boolean</option>
                            <option value="byte">Byte</option>
                            <option value="int">Integer</option>
                            <option value="int64">Integer64</option>
                            <option value="float">Float</option>
                            <option value="name">Name</option>
                            <option value="string">String</option>
                            <option value="text">Text</option>
                            <option value="vector">Vector</option>
                            <option value="rotator">Rotator</option>
                            <option value="transform">Transform</option>
                            <option value="object">Object</option>
                        </select>
                        <button id="create-var-btn">Create</button>
                    </div>
                    <div class="panel-content" style="padding: 0;">
                        <div id="graphs-list"></div>
                        <div id="functions-list"></div>
                        <div id="macros-list"></div>
                        <div id="local-variables-list"></div>
                        <div id="variables-list"></div>
                        <div id="event-dispatchers-list"></div>
                    </div>
                </div>
                <!-- PALETTE -->
                <div id="palette-panel">
                    <div class="panel-header">
                        <i class="fas fa-list" style="margin-right: 6px; font-size: 10px; opacity: 0.7;"></i>
                        <span>Palette</span>
                        <i class="fas fa-times"
                            style="margin-left: auto; font-size: 10px; color: #666; cursor: pointer;"></i>
                    </div>
                    <div class="panel-toolbar">
                        <input type="text" id="palette-filter" placeholder="Filter node list">
                    </div>
                    <div class="panel-content" id="palette-content">
                        <!-- Dynamic content generated by JS -->
                    </div>
                </div>
            </div><!-- End left-sidebar-tabs -->
        </div>
        <!-- RESIZER LEFT -->
        <div id="resizer-left" class="resizer-vertical"></div>

        <!-- CENTER AREA -->
        <div id="center-area">
            <!-- CENTER GRAPH EDITOR -->
            <div id="graph-editor" class="panel">
                <canvas id="graph-canvas"></canvas>
                <svg id="graph-svg" xmlns="http://www.w3.org/2000/svg">
                    <g id="wire-group">
                        <path id="ghost-wire" class="wire" style="pointer-events: none; display: none;"></path>
                    </g>
                </svg>
                <div id="nodes-container">
                    <!-- Nodes generated by JS -->
                </div>
                <div id="zoom-readout" style="position: absolute; top: 10px; right: 10px; color: #aaa; font-size: 12px; pointer-events: none; user-select: none;">100%</div>
            </div>
            <div id="selection-marquee" style="display: none;"></div>
        </div>

        <!-- RESIZER RIGHT -->
        <div id="resizer-right" class="resizer-vertical"></div>
        <!-- RIGHT COLUMN (Details Panel) -->
        <div id="right-panel" class="panel">
            <div class="panel-header">Details</div>
            <div id="details-panel" class="panel-content">
                <p style="color: #aaa;">Select a node or variable to view details.</p>
                <!-- Dynamic content generated by JS -->
            </div>
        </div>
        <!-- RESIZER BOTTOM -->
        <div id="resizer-bottom" class="resizer-horizontal"></div>
        <!-- BOTTOM COMPILER STRIP -->
        <div id="bottom-strip" class="panel">
            <div class="bottom-tabs">
                <div class="bottom-tab active" data-tab="compiler">Compiler Results (<span
                        id="compiler-count">0</span>)
                </div>
                <div class="bottom-tab" data-tab="find">Find Results</div>
                <div class="bottom-tab" data-tab="task-status">Task Status</div>
            </div>
            <div id="task-status-content" class="panel-content" style="display: none;">
                <div style="padding: 10px;">
                    <h3 id="task-title" style="margin-top: 0; color: #fff;">No Active Task</h3>
                    <p id="task-desc" style="color: #aaa; margin-bottom: 15px;">Select a task from the
                        toolbar to
                        begin.
                    </p>
                    <div id="task-requirements"></div>
                </div>
            </div>
            <div id="compiler-results" class="panel-content">
                <!-- Results generated by JS -->
            </div>
        </div>
    </div>
    <div id="action-menu" style="display: none;">
        <input type="text" id="action-menu-search" placeholder="Search for nodes..." autocomplete="off">
        <div id="action-menu-list"></div>
    </div>

    <!-- Context Menu -->
    <div id="context-menu" style="display: none;"></div>

    <!-- Help Modal -->
    <div id="help-modal" style="display: none;">
        <div class="modal-content">
            <h2 style="margin-top: 0;">Blueprint Editor Replica Controls</h2>
            <p>Keyboard shortcuts and interactions:</p>
            <ul>
                <li><strong>Pan:</strong> Middle Mouse, RMB Drag, or Space + LMB.</li>
                <li><strong>Zoom:</strong> Mouse Wheel.</li>
                <li><strong>Add Node:</strong> Right-click on graph.</li>
                <li><strong>Select Node:</strong> Left-click.</li>
                <li><strong>Toggle Select:</strong> Ctrl + Left-click.</li>
                <li><strong>Add Select:</strong> Shift + Left-click.</li>
                <li><strong>Marquee Select:</strong> LMB Drag on background.</li>
                <li><strong>Duplicate:</strong> Ctrl + W.</li>
                <li><strong>Add Comment:</strong> 'C' key.</li>
                <li><strong>Drag Node:</strong> Left-click and drag.</li>
                <li><strong>Connect Pin:</strong> Left-click and drag from a pin.</li>
                <li><strong>Break Links:</strong> Alt + Left-click on a pin.</li>
                <li><strong>Delete Node:</strong> Select and press Delete.</li>
                <li><strong>Compile:</strong> F7.</li>
                <li><strong>Save:</strong> Ctrl + S.</li>
            </ul>
            <button id="help-modal-close" style="margin-top: 10px;">Close</button>
            <hr style="border: 0; border-top: 1px solid #444; margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; color: #888;">Troubleshooting:</span>
                <button id="hard-reset-btn"
                    style="background-color: #d32f2f; color: white; border: 1px solid #000; padding: 6px 12px; font-size: 11px;">Hard
                    Reset (Clear Data)</button>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="confirmation-modal" style="display: none;">
        <div class="modal-content" style="max-width: 350px; text-align: center; border: 2px solid #000;">
            <h3 style="margin-top: 0; color: #eee; font-size: 14px; margin-bottom: 15px;">CONFIRM DELETE
            </h3>
            <p id="confirmation-msg" style="color: #aaa; margin-bottom: 20px; font-size: 12px;">Are you
                sure?</p>
            <div style="display: flex; justify-content: center; gap: 15px;">
                <button id="confirm-yes-btn"
                    style="background-color: #d32f2f; color: white; border: 1px solid #000; padding: 6px 20px;">Delete</button>
                <button id="confirm-no-btn"
                    style="background-color: #444; color: white; border: 1px solid #000; padding: 6px 20px;">Cancel</button>
            </div>
        </div>
    </div>

    <!-- UI Helper Utilities (must load before app.js) -->
    <script type="module" src="src/ui/ui-helpers.js?v=20251123"></script>
    <script type="module" src="src/ui/NeedNodeModal.js"></script>

    <!-- Main Application Logic -->
    <script type="module" src="src/app.js?v=20251125114000"></script>

</body>

</html>"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Successfully rewrote index.html with correct structure.")
