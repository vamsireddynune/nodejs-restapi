// Fluxon x NIE Mysore - Node.js & REST API
class FluxonPresentation {
  constructor() {
    this.currentSection = -1;
    this.totalSections = 9;
    this.isTransitioning = false;
    this.presentationStarted = false;

    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.setupInitialState();
    this.loadAllSectionContent(); // Load all content immediately
    this.initializePrism();

    console.log(
      "🚀 Fluxon Presentation initialized with",
      this.totalSections,
      "sections"
    );
  }

  cacheElements() {
    // Front page elements
    this.frontPage = document.getElementById("frontPage");
    this.startButton = document.getElementById("startPresentation");

    // Navigation elements
    this.sidebar = document.getElementById("sidebar");
    this.navItems = document.querySelectorAll(".nav-item");
    this.sections = document.querySelectorAll(".section");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.sectionIndicator = document.getElementById("sectionIndicator");
    this.progressFill = document.getElementById("progressFill");
    this.mainContent = document.querySelector(".main-content");

    // Modal elements
    this.transcriptToggle = document.getElementById("transcriptToggle");
    this.transcriptModal = document.getElementById("transcriptModal");
    this.closeTranscript = document.getElementById("closeTranscript");

    console.log("Elements cached successfully");
  }

  setupInitialState() {
    // Hide sidebar initially
    if (this.sidebar) {
      this.sidebar.classList.remove("active");
    }

    // Show front page
    if (this.frontPage) {
      this.frontPage.classList.add("active");
      this.frontPage.classList.remove("hidden");
    }

    // Hide all sections initially
    this.sections.forEach((section) => {
      section.classList.remove("active");
    });

    console.log("Initial state setup complete");
  }

  bindEvents() {
    // Start presentation button - Fixed
    if (this.startButton) {
      // Remove any existing listeners
      const newButton = this.startButton.cloneNode(true);
      this.startButton.parentNode.replaceChild(newButton, this.startButton);
      this.startButton = newButton;

      this.startButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Start button clicked via click");
        this.startPresentation();
      });

      this.startButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          console.log("Start button clicked via keyboard");
          this.startPresentation();
        }
      });

      // Add mousedown for additional compatibility
      this.startButton.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });

      // Add touchstart for mobile
      this.startButton.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.startPresentation();
      });
    }

    // Navigation item clicks - Fixed
    this.navItems.forEach((item, index) => {
      const sectionNumber = index + 1;

      // Remove existing listeners
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);

      newItem.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.presentationStarted) {
          console.log("Nav item clicked:", sectionNumber);
          this.goToSection(sectionNumber);
        }
      });

      newItem.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (this.presentationStarted) {
            this.goToSection(sectionNumber);
          }
        }
      });

      newItem.setAttribute("tabindex", "0");
      newItem.setAttribute("role", "button");
      newItem.setAttribute("aria-label", `Go to section ${sectionNumber}`);
    });

    // Re-cache nav items after replacement
    this.navItems = document.querySelectorAll(".nav-item");

    // Previous/Next buttons - Fixed
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Previous button clicked");
        this.goToSection(this.currentSection - 1);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Next button clicked");
        this.goToSection(this.currentSection + 1);
      });
    }

    // Transcript modal
    if (this.transcriptToggle) {
      this.transcriptToggle.addEventListener("click", (e) => {
        e.preventDefault();
        this.showTranscript();
      });
    }

    if (this.closeTranscript) {
      this.closeTranscript.addEventListener("click", (e) => {
        e.preventDefault();
        this.hideTranscript();
      });
    }

    if (this.transcriptModal) {
      this.transcriptModal.addEventListener("click", (e) => {
        if (e.target === this.transcriptModal) {
          this.hideTranscript();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      this.handleKeyboard(e);
    });

    // Touch support
    this.initTouchSupport();

    // Window resize
    window.addEventListener(
      "resize",
      this.debounce(() => {
        this.handleResize();
      }, 250)
    );
  }

  startPresentation() {
    console.log("🎯 Starting presentation...");

    this.presentationStarted = true;

    // Hide front page with animation
    if (this.frontPage) {
      this.frontPage.style.transition = "all 0.5s ease";
      this.frontPage.style.transform = "translateY(-20px)";
      this.frontPage.style.opacity = "0";

      setTimeout(() => {
        this.frontPage.classList.add("hidden");
        this.frontPage.classList.remove("active");
        this.frontPage.style.display = "none";
      }, 500);
    }

    // Show sidebar and main content
    setTimeout(() => {
      if (this.sidebar) {
        this.sidebar.classList.add("active");
      }

      if (this.mainContent) {
        this.mainContent.classList.add("with-sidebar");
      }

      // Show first section
      this.goToSection(1);

      // Start timer
      this.startTimer();
    }, 300);
  }

  loadAllSectionContent() {
    // Load content for all sections immediately
    for (let i = 4; i <= 9; i++) {
      this.loadSectionContent(i);
    }
  }

  goToSection(sectionNumber) {
    console.log(
      "🎯 GoToSection called:",
      sectionNumber,
      "Current:",
      this.currentSection
    );

    if (!this.presentationStarted) {
      console.log("Presentation not started yet");
      return false;
    }

    // Validate section number
    if (
      !sectionNumber ||
      sectionNumber < 1 ||
      sectionNumber > this.totalSections
    ) {
      console.log("Invalid section number:", sectionNumber);
      return false;
    }

    // Check if already on this section
    if (sectionNumber === this.currentSection) {
      console.log("Already on section:", sectionNumber);
      return false;
    }

    // Check if transitioning
    if (this.isTransitioning) {
      console.log("Currently transitioning");
      return false;
    }

    // Start transition
    this.isTransitioning = true;
    console.log("📍 Navigating to section", sectionNumber);

    // Update current section
    this.currentSection = sectionNumber;

    // Ensure content is loaded for this section
    this.loadSectionContent(sectionNumber);

    // Update UI
    this.updateUI();

    // Clear transition flag
    setTimeout(() => {
      this.isTransitioning = false;
      console.log("✅ Navigation completed to section", sectionNumber);
    }, 300);

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Announce for accessibility
    this.announceSection();

    // Hide hands-on code example behind a local storage flag
    if (sectionNumber === 9) {
      this.checkHandsOnExample();
    }

    return true;
  }

  checkHandsOnExample() {
    const enabledHandsOnExample = localStorage.getItem("enableHandsOnExample");
    if (enabledHandsOnExample === "true") {
      document
        .getElementById("handsOnCodeExample")
        .classList.remove("hidden");
    } else {
      document.getElementById("handsOnCodeExample").classList.add("hidden");
    }
  }

  loadSectionContent(sectionNumber) {
    const section = document.getElementById(`section${sectionNumber}`);
    if (!section) {
      console.log("Section not found:", sectionNumber);
      return;
    }

    // Check if section already has content beyond just the section header
    const hasContent =
      section.innerHTML.trim().length > 0 &&
      section.querySelectorAll(".section-header, .content-grid").length >= 2;

    if (hasContent) {
      console.log("Section", sectionNumber, "already has content");
      return;
    }

    const sectionContent = this.getSectionContent(sectionNumber);
    if (sectionContent) {
      section.innerHTML = sectionContent;
      console.log("✅ Loaded content for section", sectionNumber);

      // Reinitialize syntax highlighting for this section
      setTimeout(() => {
        if (typeof Prism !== "undefined") {
          Prism.highlightAll();
        }
        this.addCopyButtons();
      }, 50);
    } else {
      console.log("❌ No content found for section", sectionNumber);
    }
  }

  getSectionContent(sectionNumber) {
    const contentMap = {
      4: `
                <div class="section-header">
                    <span class="section-badge">Section 04</span>
                    <h1>JavaScript Asynchronous Processing</h1>
                    <p class="section-subtitle">Understanding the Event Loop and non-blocking execution</p>
                </div>
                
                <div class="content-grid">
                    <div class="concept-card">
                        <h3>🧵 Single Threaded Nature</h3>
                        <p>JavaScript has only <strong>ONE</strong> main thread of execution, meaning it has only one main execution thread. All your code runs in this single thread, line by line. But here's the amazing part - it can handle multiple operations simultaneously without blocking!</p>
                        
                        <div class="event-loop-components">
                            <div class="component-item">
                                <div class="component-icon">📚</div>
                                <h4>Call Stack</h4>
                                <p>Where synchronous code gets executed, one function at a time. Last In, First Out (LIFO) - like a stack of plates.</p>
                            </div>
                            <div class="component-item">
                                <div class="component-icon">🌐</div>
                                <h4>Web APIs / libuv</h4>
                                <p>Browser or Node.js handles async operations like timers, HTTP requests, file operations independently.</p>
                            </div>
                            <div class="component-item">
                                <div class="component-icon">⏳</div>
                                <h4>Callback Queue</h4>
                                <p>Completed async operations wait here to be processed. First In, First Out (FIFO) - like a queue line.</p>
                            </div>
                            <div class="component-item">
                                <div class="component-icon">🔄</div>
                                <h4>Event Loop</h4>
                                <p>Monitors the call stack and moves callbacks from queue to stack when empty. The waiter's awareness system.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="code-example-card">
                        <h3>💡 Event Loop Example</h3>
                        <div class="code-container">
                            <pre><code class="language-javascript">console.log('First - Sync');

setTimeout(() => {
  console.log('Third - Async (after 2 seconds)');
}, 2000);

setTimeout(() => {
  console.log('Fourth - Async (after 0 seconds)');
}, 0);

console.log('Second - Sync');

// Output:
// First - Sync
// Second - Sync  
// Fourth - Async (after 0 seconds)
// Third - Async (after 2 seconds)</code></pre>
                        </div>
                        
                        <div class="benefits-list">
                            <h4>Benefits of Async Processing:</h4>
                            <ul>
                                <li>Non-blocking I/O operations - File uploads don't prevent users from clicking buttons</li>
                                <li>High concurrency handling - Handle thousands of simultaneous operations efficiently</li>
                                <li>Responsive user interfaces - Users can continue browsing while images load</li>
                                <li>Resource efficiency - Lower memory usage compared to multi-threaded applications</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `,
      5: `
                <div class="section-header">
                    <span class="section-badge">Section 05</span>
                    <h1>V8 JavaScript Engine</h1>
                    <p class="section-subtitle">The powerhouse behind modern JavaScript performance</p>
                </div>
                
                <div class="content-grid">
                    <div class="engine-intro">
                        <h3>🚀 What is V8?</h3>
                        <p>V8 is Google's open-source JavaScript engine written in C++ that compiles JavaScript directly to machine code for maximum performance.</p>
                        
                        <div class="trivia-card">
                            <h4>🏎️ Fun Trivia</h4>
                            <p>V8 is named after powerful V8 car engines to symbolize performance and speed! It's open source and used by billions of people daily through Chrome and Node.js.</p>
                        </div>
                    </div>
                    
                    <div class="features-showcase">
                        <h3>⚡ Key Features</h3>
                        <div class="features-grid">
                            <div class="feature-item">
                                <div class="feature-icon">⚡</div>
                                <h4>Just-in-Time (JIT) Compilation</h4>
                                <p>Compiles JavaScript to machine code during execution for maximum speed. Much faster execution than traditional interpretation.</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">🎯</div>
                                <h4>Hidden Class Optimization</h4>
                                <p>Creates efficient internal representations of JavaScript objects. Object properties are accessed as fast as C++ struct members.</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">💾</div>
                                <h4>Inline Caching</h4>
                                <p>Remembers and optimizes frequently accessed properties and methods. Repeated operations become extremely fast.</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">🗑️</div>
                                <h4>Garbage Collection</h4>
                                <p>Automatic memory management with advanced collection techniques. Prevents memory leaks without affecting performance.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="importance-card">
                        <h3>🎯 Why V8 Matters</h3>
                        <div class="importance-list">
                            <div class="importance-item">✓ Performance Revolution - Made JavaScript fast enough for complex applications</div>
                            <div class="importance-item">✓ Node.js Foundation - Powers server-side JavaScript through Node.js</div>
                            <div class="importance-item">✓ Web Standards Driver - Pushes other browsers to improve their engines</div>
                            <div class="importance-item">✓ Cross-Platform - Runs on multiple operating systems and architectures</div>
                        </div>
                        
                        <div class="trivia-card">
                            <h4>📈 Performance Impact</h4>
                            <p><strong>Before V8:</strong> JavaScript was slow, interpreted language mainly for simple web interactions<br>
                            <strong>After V8:</strong> JavaScript became fast enough for complex applications, games, and server-side development<br>
                            <strong>Numbers:</strong> V8 can execute JavaScript 10-100 times faster than older interpreted engines!</p>
                        </div>
                    </div>
                </div>
            `,
      6: `
                <div class="section-header">
                    <span class="section-badge">Section 06</span>
                    <h1>Node.js Overview</h1>
                    <p class="section-subtitle">JavaScript runtime for server-side development</p>
                </div>
                
                <div class="content-grid">
                    <div class="nodejs-intro">
                        <h3>🟢 What is Node.js?</h3>
                        <p>Node.js is a JavaScript runtime environment built on Chrome's V8 engine that allows you to run JavaScript on the server side, outside of web browsers. Think of it as having the same language for both the dining room (frontend) and the kitchen (backend) of our restaurant.</p>
                        
                        <div class="creator-trivia">
                            <h4>👨‍💻 Creator's Story - Fun Facts</h4>
                            <p><strong>Ryan Dahl</strong> created Node.js in 2009 when he was frustrated trying to create a simple file upload progress bar! The original presentation was at European JSConf and immediately gained huge attention. He chose JavaScript because of its event-driven nature and the newly released V8 engine.</p>
                        </div>
                    </div>
                    
                    <div class="nodejs-features">
                        <h3>✨ Key Features</h3>
                        <div class="features-grid">
                            <div class="feature-item">
                                <div class="feature-icon">💻</div>
                                <h4>Server-side JavaScript</h4>
                                <p>Run JavaScript code outside of web browsers. Same language for frontend and backend development.</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">⚡</div>
                                <h4>Event-driven Architecture</h4>
                                <p>Built around events and callbacks for non-blocking operations. High performance with concurrent connections.</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">🚫</div>
                                <h4>Non-blocking I/O</h4>
                                <p>Input/output operations don't stop other code from running. Excellent performance for I/O-intensive applications.</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">🌐</div>
                                <h4>Cross-platform</h4>
                                <p>Runs on Windows, macOS, and Linux. Write once, run anywhere approach.</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">📦</div>
                                <h4>NPM Ecosystem</h4>
                                <p>Access to millions of packages and libraries. Huge ecosystem of ready-made solutions.</p>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">🚀</div>
                                <h4>Built on V8</h4>
                                <p>Uses Google's high-performance JavaScript engine. Fast execution speed and modern JavaScript features.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="use-cases">
                        <h3>🎯 Perfect Use Cases</h3>
                        <div class="use-case-grid">
                            <div class="use-case-item">
                                <h4>Web APIs & Microservices</h4>
                                <p>Building RESTful APIs and small, focused services. Excellent I/O performance and JSON handling.</p>
                            </div>
                            <div class="use-case-item">
                                <h4>Real-time Applications</h4>
                                <p>Chat applications, live collaboration tools, gaming backends. Event-driven architecture perfect for real-time communication.</p>
                            </div>
                            <div class="use-case-item">
                                <h4>Command-line Tools</h4>
                                <p>Developer tools and automation scripts. Easy to distribute and cross-platform compatible.</p>
                            </div>
                            <div class="use-case-item">
                                <h4>Desktop Applications</h4>
                                <p>Cross-platform desktop apps using Electron. VS Code, Discord, WhatsApp Desktop all use Node.js!</p>
                            </div>
                        </div>
                        
                        <div class="trivia-card">
                            <h4>🏢 Major Companies Using Node.js</h4>
                            <p><strong>Netflix:</strong> Microservices architecture for streaming platform<br>
                            <strong>LinkedIn:</strong> Backend services for mobile app (10x faster performance, 2x fewer servers)<br>
                            <strong>Uber:</strong> Real-time dispatch and tracking systems<br>
                            <strong>PayPal:</strong> Web applications and payment processing (built twice as fast with fewer developers)</p>
                        </div>
                    </div>
                </div>
            `,
      7: `
                <div class="section-header">
                    <span class="section-badge">Section 07</span>
                    <h1>NPM Package Management</h1>
                    <p class="section-subtitle">The JavaScript package ecosystem - World's largest software registry</p>
                </div>
                
                <div class="content-grid">
                    <div class="npm-intro">
                        <h3>📦 What is NPM?</h3>
                        <p>NPM (Node Package Manager) is like a massive digital marketplace where developers share and use pre-built code components. Think of NPM as a giant IKEA store for developers - instead of buying furniture parts, you're getting pre-built code components!</p>
                        
                        <div class="trivia-card">
                            <h4>📊 Scale & Impact</h4>
                            <p><strong>Over 2.1 million packages</strong> available<br>
                            <strong>Billions of downloads</strong> per month<br>
                            <strong>Millions of developers</strong> worldwide<br>
                            <strong>Fastest-growing</strong> package repository in the world!</p>
                        </div>
                    </div>
                    
                    <div class="npm-concepts">
                        <h3>🔍 Key Concepts</h3>
                        <div class="concepts-grid">
                            <div class="concept-item">
                                <div class="concept-icon">📦</div>
                                <h4>Package</h4>
                                <p>A reusable piece of code that adds functionality to your application. Like buying pre-made sauce instead of making it from scratch!</p>
                            </div>
                            <div class="concept-item">
                                <div class="concept-icon">🔗</div>
                                <h4>Dependency</h4>
                                <p>A package that your project needs to function properly. Like ingredients needed for a recipe.</p>
                            </div>
                            <div class="concept-item">
                                <div class="concept-icon">📄</div>
                                <h4>package.json</h4>
                                <p>The configuration file that describes your project and its dependencies. Like a recipe card that lists all ingredients needed.</p>
                            </div>
                            <div class="concept-item">
                                <div class="concept-icon">📁</div>
                                <h4>node_modules</h4>
                                <p>The folder where all installed packages are stored locally. Like a storage warehouse for all your purchased ingredients.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="npm-commands">
                        <h3>🛠️ Essential NPM Commands</h3>
                        <div class="commands-grid">
                            <div class="command-item">
                                <code>npm init</code>
                                <span>Start a new Node.js project with interactive setup</span>
                            </div>
                            <div class="command-item">
                                <code>npm init -y</code>
                                <span>Quick setup with default values</span>
                            </div>
                            <div class="command-item">
                                <code>npm install &lt;package&gt;</code>
                                <span>Install a specific package (e.g., npm install express)</span>
                            </div>
                            <div class="command-item">
                                <code>npm install</code>
                                <span>Install all dependencies listed in package.json</span>
                            </div>
                            <div class="command-item">
                                <code>npm install --save-dev &lt;package&gt;</code>
                                <span>Install as development dependency</span>
                            </div>
                            <div class="command-item">
                                <code>npm start</code>
                                <span>Run the 'start' script defined in package.json</span>
                            </div>
                            <div class="command-item">
                                <code>npm test</code>
                                <span>Run the 'test' script</span>
                            </div>
                            <div class="command-item">
                                <code>npm list</code>
                                <span>Show installed packages in current project</span>
                            </div>
                        </div>
                        
                        <div class="trivia-card">
                            <h4>🏷️ Version Management</h4>
                            <p><strong>^1.2.3</strong> - Compatible changes (1.2.3 to 1.x.x)<br>
                            <strong>~1.2.3</strong> - Minor changes only (1.2.3 to 1.2.x)<br>
                            <strong>1.2.3</strong> - Exact version only<br>
                            <strong>Semantic Versioning:</strong> MAJOR.MINOR.PATCH format</p>
                        </div>
                    </div>
                </div>
            `,
      8: `
                <div class="section-header">
                    <span class="section-badge">Section 08</span>
                    <h1>Express.js Framework</h1>
                    <p class="section-subtitle">Fast, unopinionated, minimalist web framework for Node.js</p>
                </div>
                
                <div class="content-grid">
                    <div class="express-intro">
                        <h3>🚄 What is Express.js?</h3>
                        <p>Express.js is a minimal, fast, and flexible Node.js web application framework that provides a robust set of features for building web and mobile applications.</p>
                    </div>
                    
                    <div class="express-benefits">
                        <h3>✨ Why Choose Express?</h3>
                        <div class="benefits-grid">
                            <div class="benefit-item">
                                <div class="benefit-icon">✨</div>
                                <h4>Simplicity</h4>
                                <p>Much less code required compared to raw Node.js. ~70% code reduction for the same functionality!</p>
                            </div>
                            <div class="benefit-item">
                                <div class="benefit-icon">🔧</div>
                                <h4>Flexibility (Unopinionated)</h4>
                                <p>Express doesn't force you into a specific way of organizing your application. Choose your own database, template engine, and file structure.</p>
                            </div>
                            <div class="benefit-item">
                                <div class="benefit-icon">🔌</div>
                                <h4>Middleware Support</h4>
                                <p>Powerful plugin system that extends functionality. Like having specialized staff members who each handle specific tasks.</p>
                            </div>
                            <div class="benefit-item">
                                <div class="benefit-icon">🛤️</div>
                                <h4>Powerful Routing</h4>
                                <p>Clean, intuitive way to handle different URLs and HTTP methods. Route parameters, query strings, and patterns.</p>
                            </div>
                            <div class="benefit-item">
                                <div class="benefit-icon">⚡</div>
                                <h4>Performance</h4>
                                <p>Lightweight framework with minimal overhead. Fast request/response cycle and efficient routing engine.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="express-example">
                        <h3>👋 Hello World Comparison</h3>
                        <div class="code-container">
                            <pre><code class="language-javascript">// Express.js - Simple & Clean
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log('🚀 Server running on port 3000');
});

// Raw Node.js would require ~50 lines for the same functionality!</code></pre>
                        </div>
                        
                        <div class="core-concepts">
                            <h4>🎯 Core Concepts:</h4>
                            <div class="concepts-list">
                                <div class="concept-tag">Application Object - Configure your server</div>
                                <div class="concept-tag">Routing - Handle different URLs and methods</div>
                                <div class="concept-tag">Middleware - Process requests in pipeline</div>
                                <div class="concept-tag">Request/Response - Handle HTTP communications</div>
                            </div>
                        </div>
                        
                        <div class="trivia-card">
                            <h4>🔧 Common Middleware Examples</h4>
                            <p><strong>express.json()</strong> - Parse JSON request bodies<br>
                            <strong>express.static()</strong> - Serve static files (CSS, JS, images)<br>
                            <strong>cors</strong> - Enable cross-origin resource sharing<br>
                            <strong>helmet</strong> - Set security headers<br>
                            <strong>morgan</strong> - HTTP request logging</p>
                        </div>
                    </div>
                </div>
            `,
      9: `
                <div class="section-header">
                    <span class="section-badge">Section 09</span>
                    <h1>Building Sample REST API</h1>
                    <p class="section-subtitle">Task Management API - Complete implementation with all CRUD operations</p>
                </div>
                
                <div class="content-grid">
                    <div class="project-overview">
                        <h3>🎯 Project: Task Management API</h3>
                        <p>We'll build a complete REST API demonstrating all concepts we've learned. Think of it as creating a digital task board for a restaurant team - showcasing everything from Express.js setup to error handling!</p>
                        
                        <div class="project-features">
                            <h4>🌟 Features Included:</h4>
                            <div class="features-tags">
                                <span class="feature-tag">Create tasks (POST)</span>
                                <span class="feature-tag">Read tasks (GET)</span>
                                <span class="feature-tag">Update tasks (PUT/PATCH)</span>
                                <span class="feature-tag">Delete tasks (DELETE)</span>
                                <span class="feature-tag">Input validation</span>
                                <span class="feature-tag">Error handling</span>
                                <span class="feature-tag">Filtering & search</span>
                                <span class="feature-tag">Statistics endpoint</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="setup-guide">
                        <h3>🛠️ Project Setup Steps</h3>
                        <div class="setup-steps">
                            <div class="step-item">
                                <span class="step-number">1</span>
                                <div>
                                    <code>mkdir task-management-api && cd task-management-api</code>
                                    <p>Create project directory</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <span class="step-number">2</span>
                                <div>
                                    <code>npm init -y</code>
                                    <p>Initialize NPM project with defaults</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <span class="step-number">3</span>
                                <div>
                                    <code>npm install express</code>
                                    <p>Install Express.js framework</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <span class="step-number">4</span>
                                <div>
                                    <code>npm install --save-dev nodemon</code>
                                    <p>Install nodemon for development</p>
                                </div>
                            </div>
                            <div class="step-item">
                                <span class="step-number">5</span>
                                <div>
                                    <code>Create server.js and start coding!</code>
                                    <p>Build your API implementation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="api-endpoints">
                        <h3>🔗 API Endpoints Overview</h3>
                        <div class="endpoints-grid">
                            <div class="endpoint-item get">
                                <span class="method-badge">GET</span>
                                <code>/api/tasks</code>
                                <span class="description">Get all tasks (supports filtering)</span>
                            </div>
                            <div class="endpoint-item get">
                                <span class="method-badge">GET</span>
                                <code>/api/tasks/:id</code>
                                <span class="description">Get specific task by ID</span>
                            </div>
                            <div class="endpoint-item post">
                                <span class="method-badge">POST</span>
                                <code>/api/tasks</code>
                                <span class="description">Create new task</span>
                            </div>
                            <div class="endpoint-item put">
                                <span class="method-badge">PUT</span>
                                <code>/api/tasks/:id</code>
                                <span class="description">Update complete task</span>
                            </div>
                            <div class="endpoint-item patch">
                                <span class="method-badge">PATCH</span>
                                <code>/api/tasks/:id</code>
                                <span class="description">Partially update task</span>
                            </div>
                            <div class="endpoint-item delete">
                                <span class="method-badge">DELETE</span>
                                <code>/api/tasks/:id</code>
                                <span class="description">Delete task</span>
                            </div>
                            <div class="endpoint-item get">
                                <span class="method-badge">GET</span>
                                <code>/api/stats</code>
                                <span class="description">Get task statistics</span>
                            </div>
                        </div>
                    </div>

                    <div class="complete-code hidden" id="handsOnCodeExample">
                        <h3>💻 Complete API Implementation</h3>
                        <div class="code-container">
                            <pre><code class="language-javascript">const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Parse JSON request bodies
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  next();
});

// ============================================
// DATA STORAGE (In-Memory Database)
// ============================================

let tasks = [
  {
    id: 1,
    title: 'Set up restaurant opening checklist',
    description: 'Create checklist for daily opening procedures',
    completed: false,
    priority: 'high',
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z')
  },
  {
    id: 2,
    title: 'Update menu prices',
    description: 'Review and update menu prices for new season',
    completed: false,
    priority: 'medium',
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T09:00:00Z')
  },
  {
    id: 3,
    title: 'Train new server',
    description: 'Complete onboarding training for new team member',
    completed: true,
    priority: 'high',
    createdAt: new Date('2024-01-14T10:00:00Z'),
    updatedAt: new Date('2024-01-15T16:00:00Z')
  }
];

let nextId = 4;

// ============================================
// HELPER FUNCTIONS
// ============================================

// Validate task data
const validateTask = (taskData, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate || taskData.title !== undefined) {
    if (!taskData.title || typeof taskData.title !== 'string') {
      errors.push('Title is required and must be a string');
    } else if (taskData.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }
  }
  
  if (taskData.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(taskData.priority)) {
      errors.push('Priority must be low, medium, or high');
    }
  }
  
  if (taskData.completed !== undefined && typeof taskData.completed !== 'boolean') {
    errors.push('Completed must be a boolean (true or false)');
  }
  
  return errors;
};

// Find task by ID
const findTaskById = (id) => {
  const taskId = parseInt(id);
  return tasks.find(task => task.id === taskId);
};

// ============================================
// API ROUTES
// ============================================

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    message: 'Task Management API',
    version: '1.0.0',
    endpoints: {
      'GET /api/tasks': 'Get all tasks (supports filtering)',
      'GET /api/tasks/:id': 'Get specific task',
      'POST /api/tasks': 'Create new task',
      'PUT /api/tasks/:id': 'Update entire task',
      'PATCH /api/tasks/:id': 'Partially update task',
      'DELETE /api/tasks/:id': 'Delete task',
      'GET /api/stats': 'Get task statistics'
    }
  });
});

// GET /api/tasks - Retrieve all tasks (with filtering)
app.get('/api/tasks', (req, res) => {
  try {
    let filteredTasks = [...tasks];
    
    // Filter by completion status
    if (req.query.completed !== undefined) {
      const isCompleted = req.query.completed.toLowerCase() === 'true';
      filteredTasks = filteredTasks.filter(task => task.completed === isCompleted);
    }
    
    // Filter by priority
    if (req.query.priority) {
      filteredTasks = filteredTasks.filter(task => 
        task.priority.toLowerCase() === req.query.priority.toLowerCase()
      );
    }
    
    // Search in title and description
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort tasks (newest first by default)
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      count: filteredTasks.length,
      totalTasks: tasks.length,
      data: filteredTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving tasks',
      error: error.message
    });
  }
});

// POST /api/tasks - Create new task
app.post('/api/tasks', (req, res) => {
  try {
    const validationErrors = validateTask(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    const newTask = {
      id: nextId++,
      title: req.body.title.trim(),
      description: req.body.description ? req.body.description.trim() : '',
      completed: false,
      priority: req.body.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    tasks.push(newTask);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: \`Task with ID \${req.params.id} not found\`
      });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

// GET /api/stats - Get task statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      pending: tasks.filter(task => !task.completed).length,
      byPriority: {
        high: tasks.filter(task => task.priority === 'high').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        low: tasks.filter(task => task.priority === 'low').length
      },
      completionRate: tasks.length > 0 
        ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100)
        : 0
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: error.message
    });
  }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: \`Route \${req.method} \${req.originalUrl} not found\`
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\\n🚀 Task Management API Server Started!');
  console.log(\`📍 Server running on http://localhost:\${PORT}\`);
  console.log('\\n💡 Use Postman, curl, or your browser to test the API!');
});</code></pre>
                        </div>
                    </div>
                    
                    <div class="next-steps">
                        <h3>🚀 Next Steps for Enhancement</h3>
                        <div class="next-steps-grid">
                            <div class="next-step-item">
                                <div class="step-icon">🗄️</div>
                                <span><strong>Database Integration:</strong> Replace in-memory storage with MongoDB or PostgreSQL for data persistence</span>
                            </div>
                            <div class="next-step-item">
                                <div class="step-icon">🔐</div>
                                <span><strong>Authentication:</strong> Add user registration, login system, and JWT token-based authentication</span>
                            </div>
                            <div class="next-step-item">
                                <div class="step-icon">✅</div>
                                <span><strong>Testing:</strong> Add unit tests, integration tests, and automated testing in CI/CD pipeline</span>
                            </div>
                            <div class="next-step-item">
                                <div class="step-icon">🛡️</div>
                                <span><strong>Security:</strong> Add rate limiting, input sanitization, security headers, and CORS configuration</span>
                            </div>
                            <div class="next-step-item">
                                <div class="step-icon">📚</div>
                                <span><strong>Documentation:</strong> Add interactive API documentation with Swagger/OpenAPI</span>
                            </div>
                            <div class="next-step-item">
                                <div class="step-icon">☁️</div>
                                <span><strong>Deployment:</strong> Deploy to cloud platforms with environment configuration and monitoring</span>
                            </div>
                        </div>
                    </div>
                </div>
            `,
    };

    return contentMap[sectionNumber] || "";
  }

  updateUI() {
    this.updateSections();
    this.updateNavigation();
    this.updateButtons();
    this.updateProgressBar();
    this.updateSectionIndicator();

    // Reinitialize syntax highlighting
    setTimeout(() => {
      if (typeof Prism !== "undefined") {
        Prism.highlightAll();
      }
      this.addCopyButtons();
    }, 100);
  }

  updateSections() {
    this.sections.forEach((section, index) => {
      const sectionNumber = index + 1;
      const isActive = sectionNumber === this.currentSection;

      section.classList.toggle("active", isActive);

      if (isActive) {
        section.style.display = "block";
        section.setAttribute("aria-hidden", "false");
      } else {
        section.style.display = "none";
        section.setAttribute("aria-hidden", "true");
      }
    });
  }

  updateNavigation() {
    this.navItems.forEach((item, index) => {
      const sectionNumber = index + 1;
      const isActive = sectionNumber === this.currentSection;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  updateButtons() {
    if (this.prevBtn) {
      const canGoPrev = this.currentSection > 1;
      this.prevBtn.disabled = !canGoPrev;
      this.prevBtn.setAttribute("aria-disabled", !canGoPrev);
    }

    if (this.nextBtn) {
      const canGoNext = this.currentSection < this.totalSections;
      this.nextBtn.disabled = !canGoNext;
      this.nextBtn.setAttribute("aria-disabled", !canGoNext);
    }
  }

  updateProgressBar() {
    if (this.progressFill) {
      const progress = (this.currentSection / this.totalSections) * 100;
      this.progressFill.style.width = `${progress}%`;
      this.progressFill.setAttribute("aria-valuenow", this.currentSection);
      this.progressFill.setAttribute("aria-valuemax", this.totalSections);
    }
  }

  updateSectionIndicator() {
    if (this.sectionIndicator) {
      this.sectionIndicator.textContent = `${this.currentSection} / ${this.totalSections}`;
    }
  }

  showTranscript() {
    if (this.transcriptModal) {
      this.transcriptModal.classList.remove("hidden");
      this.transcriptModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        if (this.closeTranscript) {
          this.closeTranscript.focus();
        }
      }, 100);
    }
  }

  hideTranscript() {
    if (this.transcriptModal) {
      this.transcriptModal.classList.add("hidden");
      this.transcriptModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "auto";

      if (this.transcriptToggle) {
        this.transcriptToggle.focus();
      }
    }
  }

  handleKeyboard(e) {
    // Don't interfere if modal is open
    if (
      this.transcriptModal &&
      !this.transcriptModal.classList.contains("hidden")
    ) {
      if (e.key === "Escape") {
        this.hideTranscript();
      }
      return;
    }

    // Don't interfere if not in presentation mode
    if (!this.presentationStarted) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.startPresentation();
      }
      return;
    }

    // Don't interfere if user is typing
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        this.goToSection(this.currentSection - 1);
        break;
      case "ArrowRight":
      case "ArrowDown":
      case " ":
        e.preventDefault();
        this.goToSection(this.currentSection + 1);
        break;
      case "Home":
        e.preventDefault();
        this.goToSection(1);
        break;
      case "End":
        e.preventDefault();
        this.goToSection(this.totalSections);
        break;
      case "t":
      case "T":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.showTranscript();
        }
        break;
      case "Escape":
        this.hideTranscript();
        break;
      default:
        // Handle number keys for direct section navigation
        const num = parseInt(e.key);
        if (num >= 1 && num <= this.totalSections) {
          e.preventDefault();
          this.goToSection(num);
        }
        break;
    }
  }

  initTouchSupport() {
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    if (!this.mainContent) return;

    this.mainContent.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    this.mainContent.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;

        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);

        // Only trigger if horizontal swipe is more than vertical
        if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY) {
          if (diffX > 0) {
            // Swiped left - next section
            this.goToSection(this.currentSection + 1);
          } else {
            // Swiped right - previous section
            this.goToSection(this.currentSection - 1);
          }
        }
      },
      { passive: true }
    );
  }

  handleResize() {
    // Handle responsive behavior
    const isMobile = window.innerWidth <= 768;

    if (isMobile && this.sidebar) {
      this.sidebar.classList.remove("active");
      if (this.mainContent) {
        this.mainContent.classList.remove("with-sidebar");
      }
    } else if (this.presentationStarted && this.sidebar) {
      this.sidebar.classList.add("active");
      if (this.mainContent) {
        this.mainContent.classList.add("with-sidebar");
      }
    }
  }

  initializePrism() {
    if (typeof Prism !== "undefined") {
      setTimeout(() => {
        Prism.highlightAll();
      }, 100);
    }
  }

  addCopyButtons() {
    const codeBlocks = document.querySelectorAll("pre code");

    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentNode;

      if (pre.querySelector(".copy-btn")) return;

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy";
      copyBtn.className = "copy-btn";
      copyBtn.setAttribute("aria-label", "Copy code to clipboard");
      copyBtn.style.cssText = `
                position: absolute;
                top: 12px;
                right: 12px;
                background: var(--fluxon-primary);
                color: var(--fluxon-light);
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                opacity: 0.9;
                transition: all 0.2s ease;
                z-index: 10;
            `;

      copyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.copyToClipboard(codeBlock.textContent);
        copyBtn.textContent = "Copied!";
        copyBtn.style.background = "var(--fluxon-success)";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
          copyBtn.style.background = "var(--fluxon-primary)";
        }, 2000);
      });

      pre.style.position = "relative";
      pre.appendChild(copyBtn);
    });
  }

  copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showNotification("Code copied to clipboard!");
        })
        .catch(() => {
          this.fallbackCopyToClipboard(text);
        });
    } else {
      this.fallbackCopyToClipboard(text);
    }
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      this.showNotification("Code copied to clipboard!");
    } catch (err) {
      console.error("Could not copy text: ", err);
    }

    document.body.removeChild(textArea);
  }

  showNotification(message, duration = 3000) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--fluxon-primary);
            color: var(--fluxon-light);
            padding: 12px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 1001;
            animation: slideInNotification 0.3s ease;
            font-weight: 600;
            font-size: 14px;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutNotification 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  startTimer() {
    this.startTime = Date.now();
    const timerDisplay = document.createElement("div");
    timerDisplay.className = "presentation-timer";
    timerDisplay.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 40px;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 8px 16px;
            border-radius: 12px;
            font-family: var(--font-mono);
            font-size: 12px;
            z-index: 100;
            border: 1px solid var(--border-color);
            backdrop-filter: blur(20px);
            box-shadow: var(--shadow-md);
        `;

    const updateTimer = () => {
      if (this.startTime) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        timerDisplay.textContent = `⏱️ ${this.formatTime(elapsed)}`;
      }
    };

    this.timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    document.body.appendChild(timerDisplay);
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  announceSection() {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = `Section ${this.currentSection} of ${this.totalSections}`;

    document.body.appendChild(announcement);

    setTimeout(() => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Initializing Fluxon Presentation...");

  setTimeout(() => {
    const presentation = new FluxonPresentation();

    // Global access for debugging
    window.fluxonPresentation = presentation;

    console.log("✨ Fluxon x NIE Mysore Presentation Ready!");
    console.log('🎯 Press ENTER or click "Start Presentation" to begin');
    console.log(
      "📱 Navigation: Sidebar, Next/Prev, Keyboard (←→), Touch swipe"
    );
    console.log("⌨️ Shortcuts: Ctrl+T (transcript), 1-9 (sections), Home/End");
  }, 100);
});
