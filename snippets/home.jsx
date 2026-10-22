/* Sendify 帮助中心首页。样式位于 /style.css 的 .dt-home 命名空间。 */

export const Home = ({ t, arts, hot, journeys, searchItems = arts, locale = "cn" }) => {
  const homeRef = useRef(null);
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const resourceRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);


  // The reference site's canvas algorithm is preserved; only container sizing and lifecycle differ.
  useEffect(() => {
    const heroGrid = canvasRef.current;
    const context = heroGrid?.getContext("2d");
    if (!context) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionPreference.matches;
    const spacing = 22;
    const cycleDuration = 12000;
    let gridWidth = 0;
    let gridHeight = 0;
    let columns = 0;
    let rows = 0;
    let cells = [];
    let frameId = 0;
    let inView = true;
    const hash=(column,row)=>{
      const value=Math.sin(column*12.9898+row*78.233)*43758.5453;
      return value-Math.floor(value);
    };

    const roundedSquare=(x,y,size,radius)=>{
      const half=size/2;
      context.beginPath();
      context.moveTo(x-half+radius,y-half);
      context.lineTo(x+half-radius,y-half);
      context.quadraticCurveTo(x+half,y-half,x+half,y-half+radius);
      context.lineTo(x+half,y+half-radius);
      context.quadraticCurveTo(x+half,y+half,x+half-radius,y+half);
      context.lineTo(x-half+radius,y+half);
      context.quadraticCurveTo(x-half,y+half,x-half,y+half-radius);
      context.lineTo(x-half,y-half+radius);
      context.quadraticCurveTo(x-half,y-half,x-half+radius,y-half);
      context.closePath();
      context.fill();
    };

    const rebuildGrid=()=>{
      const ratio=Math.min(window.devicePixelRatio||1,2);
      gridWidth=homeRef.current.clientWidth;
      const navigationHeight=headerRef.current.offsetHeight;
      const heroHeight=heroRef.current.offsetHeight;
      gridHeight=navigationHeight+heroHeight;
      homeRef.current.style.setProperty("--dt-home-backdrop-height", `${gridHeight}px`);
      heroGrid.style.width=`${gridWidth}px`;
      heroGrid.style.height=`${gridHeight}px`;
      heroGrid.width=Math.round(gridWidth*ratio);
      heroGrid.height=Math.round(gridHeight*ratio);
      context.setTransform(ratio,0,0,ratio,0,0);
      columns=Math.ceil(gridWidth/spacing)+2;
      rows=Math.ceil(gridHeight/spacing)+2;
      cells=[];
      for(let row=0;row<rows;row++){
        for(let column=0;column<columns;column++){
          const seed=hash(column,row);
          cells.push({
            column,
            row,
            x:column*spacing-spacing/2,
            y:row*spacing-spacing/2,
            shape:Math.floor(seed*3),
            color:Math.floor(hash(column+19,row+7)*3),
            phase:hash(column+41,row+23)*Math.PI*2,
            alpha:.05+hash(column+3,row+31)*.04
          });
        }
      }
    };

    const drawGrid=(time)=>{
      context.clearRect(0,0,gridWidth,gridHeight);
      const progress=reduceMotion ? .32 : (time%cycleDuration)/cycleDuration;
      const cycleAngle=progress*Math.PI*2;
      const emitters=[
        {
          x:gridWidth*(.18+.13*Math.sin(cycleAngle)),
          y:gridHeight*(.22+.12*Math.cos(cycleAngle*2)),
          radius:165+38*Math.sin(cycleAngle*2+.4)
        },
        {
          x:gridWidth*(.48+.2*Math.sin(cycleAngle*2+1.7)),
          y:gridHeight*(.18+.13*Math.cos(cycleAngle+.8)),
          radius:205+42*Math.cos(cycleAngle*3+1.2)
        },
        {
          x:gridWidth*(.78+.14*Math.sin(cycleAngle*3+2.2)),
          y:gridHeight*(.32+.14*Math.cos(cycleAngle*2+2.4)),
          radius:178+34*Math.sin(cycleAngle+2.6)
        },
        {
          x:gridWidth*(.55+.3*Math.sin(cycleAngle+4)),
          y:gridHeight*(.48+.08*Math.cos(cycleAngle*3+.5)),
          radius:145+30*Math.cos(cycleAngle*2+3.1)
        }
      ];
      const colorPalette=['rgb(126,163,255)','rgb(255,255,255)','rgb(206,223,119)'];

      for(const cell of cells){
        let influence=0;
        for(const emitter of emitters){
          const dx=cell.x-emitter.x;
          const dy=cell.y-emitter.y;
          const distanceSquared=dx*dx+dy*dy;
          const field=Math.exp(-distanceSquared/(2*emitter.radius*emitter.radius));
          influence=Math.max(influence,field);
        }
        const pulse=.5+.5*Math.sin(progress*Math.PI*4+cell.phase+cell.column*.12);
        const scale=.18+.82*(.12+.88*influence)*(.72+.28*pulse);
        const size=12*scale;
        const verticalFade=1-Math.max(0,Math.min(1,(cell.y-gridHeight*.48)/(gridHeight*.48)));
        const centerX=(cell.x-gridWidth*.5)/(gridWidth*.24);
        const centerY=(cell.y-gridHeight*.28)/(gridHeight*.28);
        const textClear=1-.46*Math.exp(-(centerX*centerX+centerY*centerY));
        const alpha=cell.alpha*verticalFade*textClear*(.68+.32*influence);
        if(alpha<.004||size<1) continue;

        context.globalAlpha=alpha;
        context.fillStyle=colorPalette[cell.color];
        if(cell.shape===0){
          context.beginPath();
          context.arc(cell.x,cell.y,size/2,0,Math.PI*2);
          context.fill();
        }else if(cell.shape===1){
          roundedSquare(cell.x,cell.y,size,Math.max(1,size*.24));
        }else{
          context.save();
          context.translate(cell.x,cell.y);
          context.rotate(Math.PI/4);
          roundedSquare(0,0,size*.82,Math.max(.8,size*.16));
          context.restore();
        }
      }
      context.globalAlpha=1;
    };

    const animateGrid = (time) => {
      drawGrid(time);
      frameId = requestAnimationFrame(animateGrid);
    };
    const syncAnimation = () => {
      cancelAnimationFrame(frameId);
      if (document.hidden || !inView) return;
      if (reduceMotion) drawGrid(cycleDuration * .32);
      else frameId = requestAnimationFrame(animateGrid);
    };
    const resizeGrid = () => {
      rebuildGrid();
      syncAnimation();
    };
    const changeMotion = () => {
      reduceMotion = motionPreference.matches;
      syncAnimation();
    };
    const resizeObserver = new ResizeObserver(resizeGrid);
    resizeObserver.observe(headerRef.current);
    resizeObserver.observe(heroRef.current);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAnimation();
    });
    visibilityObserver.observe(heroGrid);
    resizeGrid();
    window.addEventListener("resize", resizeGrid, { passive: true });
    document.addEventListener("visibilitychange", syncAnimation);
    motionPreference.addEventListener("change", changeMotion);
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("resize", resizeGrid);
      document.removeEventListener("visibilitychange", syncAnimation);
      motionPreference.removeEventListener("change", changeMotion);
    };
  }, []);

  useEffect(() => {
    const syncHeader = () => headerRef.current?.classList.toggle("is-scrolled", window.scrollY > 12);
    const closeMenus = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && headerRef.current?.contains(event.target)) return;
      const menuToggle = headerRef.current?.querySelector(".dt-home-menu-toggle");
      const mobileMenuWasOpen = menuToggle?.getAttribute("aria-expanded") === "true";
      setResourceOpen(false);
      setMenuOpen(false);
      if (event.type === "keydown" && mobileMenuWasOpen) menuToggle.focus();
    };
    const resizeMenus = () => {
      setResourceOpen(false);
      setMenuOpen(false);
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", resizeMenus, { passive: true });
    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("keydown", closeMenus);
    return () => {
      window.removeEventListener("scroll", syncHeader);
      window.removeEventListener("resize", resizeMenus);
      document.removeEventListener("pointerdown", closeMenus);
      document.removeEventListener("keydown", closeMenus);
    };
  }, []);

  const isEnglish = locale === "en";
  const localePrefix = isEnglish ? "/en" : "";
  const pageHref = (slug) => `${localePrefix}/${slug}`;
  const helpCenterHref = isEnglish ? "/" : "/zh/index";
  const ui = isEnglish
    ? {
        searchFound: (count) => `${count} relevant ${count === 1 ? "article" : "articles"} found`,
        searchEmpty: "No relevant articles found",
        home: "Home",
        pricing: "Pricing",
        contactUs: "Contact Us",
        login: "Log in",
        tryFree: "Try for free",
        menu: "Menu",
        closeMenu: "Close",
        helpCenter: "Help Center",
        openMenu: "Open navigation menu",
        clearSearch: "Clear search",
        quickStart: "Quick start",
        journeyTitle: "Good emails start here.",
        journeyDescription: "Move from setup to performance analysis with task-based guides.",
        developerAccess: "Developer access",
        developerTitle: "Build your own way.",
        developerDescription: "Build with the Open API or let AI assistants query Sendify data securely through MCP.",
        apiDescription: "Use a Bearer API Key to automate campaigns and contact workflows.",
        apiLink: "View API docs",
        mcpDescription: "Connect Codex, Cursor, or Claude and query campaigns and contacts in natural language.",
        mcpLink: "Connect MCP",
        commonGuides: "Popular guides",
        allGuides: "View all guides",
        moreQuestions: "Still have questions?",
        contact: "Contact us",
        resources: "Resources",
        legal: "Legal",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        sla: "Service Level Agreement",
      }
    : {
        searchFound: (count) => `找到 ${count} 篇相关内容`,
        searchEmpty: "暂未找到相关内容",
        home: "首页",
        pricing: "价格",
        contactUs: "联系我们",
        login: "登录",
        tryFree: "免费试用",
        menu: "菜单",
        closeMenu: "关闭",
        helpCenter: "帮助中心",
        openMenu: "打开导航菜单",
        clearSearch: "清空搜索",
        quickStart: "快速开始",
        journeyTitle: "沿着使用路径，找到需要的答案",
        journeyDescription: "从基础配置到效果分析，按任务阶段快速进入对应指南。",
        developerAccess: "开发者接入",
        developerTitle: "选择适合你的集成方式",
        developerDescription: "通过 Open API 构建业务集成，或让 AI 助手用 MCP 安全查询 Sendify 数据。",
        apiDescription: "使用 Bearer API Key 调用联系人等接口，构建自动化工作流。",
        apiLink: "查看 API 文档",
        mcpDescription: "连接 Codex、Cursor 或 Claude，用自然语言查询营销活动与联系人。",
        mcpLink: "开始接入 MCP",
        commonGuides: "常用指南",
        allGuides: "查看全部指南",
        moreQuestions: "还有疑问？",
        contact: "联系我们",
        resources: "资源",
        legal: "法律协议",
        privacy: "隐私政策",
        terms: "服务协议",
        sla: "服务等级协议",
      };
  const applySearchQuery = (query, focus = false) => {
    if (typeof document === "undefined") return;
    const input = document.getElementById("home-search-input");
    const panel = document.getElementById("home-search-results");
    const summary = document.getElementById("home-search-summary");
    const submit = document.getElementById("home-search-submit");
    if (!input || !panel || !summary || !submit) return;

    const normalizedQuery = query.trim().toLocaleLowerCase(isEnglish ? "en" : "zh-CN");
    let visibleCount = 0;
    input.value = query;
    input.setAttribute("aria-expanded", String(Boolean(normalizedQuery)));

    panel.querySelectorAll("[data-search-item]").forEach((item) => {
      const matches =
        Boolean(normalizedQuery) &&
        item.dataset.searchText.includes(normalizedQuery) &&
        visibleCount < 6;
      item.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    panel.hidden = !normalizedQuery;
    submit.disabled = visibleCount === 0;
    summary.textContent = visibleCount
      ? ui.searchFound(visibleCount)
      : ui.searchEmpty;
    if (focus) requestAnimationFrame(() => input.focus());
  };

  const productDocsHref = pageHref("getting-started");
  const apiDocsHref = pageHref("developer/overview");
  const mcpDocsHref = pageHref("mcp/overview");
  const websiteHref = "https://www.sendify.dingstore.cn/";
  const pricingHref = "https://www.sendify.dingstore.cn/pricing";
  const websiteContactHref = "https://www.sendify.dingstore.cn/contact-us";
  const supportEmail = "sendify-support@dingmail.work";
  const supportMail = `mailto:${supportEmail}`;
  const legalLinks = [
    [
      ui.privacy,
      "https://terms.alicdn.com/legal-agreement/terms/privacy_policy_full/20250320112834560/20250320112834560.html",
    ],
    [
      ui.terms,
      "https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20250320110123957/20250320110123957.html",
    ],
    [
      ui.sla,
      "https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20250320143730445/20250320143730445.html",
    ],
  ];

  const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </svg>
  );

  const JourneyIcon = ({ name }) => {
    if (name === "domain") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
          <path d="m6 8 6 5 6-5" />
        </svg>
      );
    }
    if (name === "contacts") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="7.5" r="4" />
          <path d="M4 20.5a8 8 0 0 1 16 0" />
        </svg>
      );
    }
    if (name === "send") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m21 3-7 18-3.5-7.5L3 10l18-7Z" />
          <path d="M10.5 13.5 21 3" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 20v-4m4 4v-8m4 8V9m4 11V5m4 15V2" />
      </svg>
    );
  };

  const renderHeader = () => (
    <header ref={headerRef} className="dt-home-header">
      <nav className="dt-home-nav" aria-label={isEnglish ? "Primary navigation" : "主导航"}
        onClick={(event) => {
          if (event.target.closest("a[href]")) {
            setMenuOpen(false);
            setResourceOpen(false);
          }
        }}>
        <a href={websiteHref} className="dt-home-brand" aria-label={isEnglish ? "Sendify website" : "Sendify 官网"}>
          <span className="dt-home-brand-logo" aria-hidden="true" />
        </a>

        <div className={`dt-home-nav-links${menuOpen ? " is-mobile-open" : ""}`} id="help-home-navigation">
          <a href={websiteHref}>{ui.home}</a>
          <a href={pricingHref}>{ui.pricing}</a>
          <a href={websiteContactHref}>{ui.contactUs}</a>
          <div ref={resourceRef} className={`dt-home-nav-resource${resourceOpen ? " is-open" : ""}`}
            onMouseEnter={() => {
              if (window.matchMedia("(min-width: 851px) and (hover: hover)").matches) setResourceOpen(true);
            }}
            onMouseLeave={() => {
              if (window.matchMedia("(min-width: 851px)").matches) setResourceOpen(false);
            }}
            onFocus={() => {
              if (window.matchMedia("(min-width: 851px)").matches) setResourceOpen(true);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setResourceOpen(false);
            }}>
            <button className="dt-home-resource-trigger" type="button" aria-expanded={resourceOpen}
              aria-controls="help-home-resource-menu" onClick={() => {
                setResourceOpen(window.matchMedia("(min-width: 851px)").matches ? true : !resourceOpen);
              }}>
              {ui.resources}
            </button>
            <div className="dt-home-resource-menu" id="help-home-resource-menu" aria-label={ui.resources}>
              <a href={helpCenterHref} aria-current="page">{ui.helpCenter}</a>
              <a href={apiDocsHref}>Open API</a>
              <a href={mcpDocsHref}>MCP</a>
            </div>
          </div>
        </div>

        <div className="dt-home-nav-actions">
          <a className="dt-home-login">{ui.login}</a>
          <a className="dt-home-nav-button dt-home-try-free">{ui.tryFree}</a>
          <button className="dt-home-nav-button dt-home-menu-toggle" type="button"
            aria-label={menuOpen ? ui.closeMenu : ui.openMenu} aria-expanded={menuOpen}
            aria-controls="help-home-navigation" onClick={() => {
              setMenuOpen(!menuOpen);
              setResourceOpen(false);
            }}>
            {menuOpen ? ui.closeMenu : ui.menu}
          </button>
        </div>
      </nav>
    </header>
  );

  const renderHelpVisual = () => (
    <div className="intl-orbit" aria-hidden="true">
      <div className="intl-orbit-ring" /><div className="intl-orbit-ring intl-orbit-ring-inner" />
      <div className="intl-orbit-core"><svg viewBox="0 0 80 80" fill="none"><path d="M12 21h56v38H12z" stroke="currentColor" strokeWidth="3"/><path d="m12 21 28 23 28-23" stroke="currentColor" strokeWidth="3"/></svg></div>
      <span className="intl-orbit-label intl-orbit-label-one">Create <b>✦</b></span>
      <span className="intl-orbit-label intl-orbit-label-two">Connect</span>
      <span className="intl-orbit-label intl-orbit-label-three">Grow <b>✓</b></span>
      <span className="intl-orbit-note">YOUR NEXT GREAT SEND<br />STARTS HERE.</span>
    </div>
  );

  const renderHero = () => (
    <main ref={heroRef} className="dt-home-hero">
      <div className="dt-home-hero-grid dt-home-wrap">
        <div className="dt-home-hero-copy">
          <h1>{isEnglish ? <>A little guidance.<br /><em>A lot more possibility.</em></> : t.title}</h1>
          <p>{t.subtitle}</p>

          <form
            className="dt-home-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const firstResult = document.querySelector(
                "#home-search-results [data-search-item]:not([hidden]) a"
              );
              if (firstResult) window.location.assign(firstResult.href);
            }}
          >
            <SearchIcon />
            <input
              id="home-search-input"
              name="query"
              type="search"
              aria-label={t.ph}
              aria-controls="home-search-results"
              aria-expanded="false"
              placeholder={t.ph}
              autoComplete="off"
              onInput={(event) => applySearchQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") applySearchQuery("", true);
              }}
            />
            <button id="home-search-submit" type="submit" aria-label={t.search_btn} disabled>
              <span>{t.search_btn}</span>
            </button>
          </form>

          <div className="dt-home-search-results" id="home-search-results" aria-live="polite" hidden>
            <div className="dt-home-search-summary">
              <span id="home-search-summary" />
              <button type="button" onClick={() => applySearchQuery("", true)} aria-label={ui.clearSearch}>{ui.clearSearch}</button>
            </div>
            <ul>
              {searchItems.map((item) => (
                <li
                  key={item.slug}
                  data-search-item
                  data-search-text={[item.t, item.tag, item.description, item.keywords]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase(isEnglish ? "en" : "zh-CN")}
                  hidden
                >
                  <a href={pageHref(item.slug)}>
                    <span>{item.tag}</span>
                    <strong>{item.t}</strong>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="dt-home-hot" aria-label={isEnglish ? "Popular searches" : "热门搜索"}>
            <span>{t.hot_label}</span>
            {hot.map((tag) => (
              <button key={tag} type="button" onClick={() => applySearchQuery(tag, true)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
        {renderHelpVisual()}
      </div>
    </main>
  );

  const renderJourneys = () => (
    <section className="dt-home-journeys" aria-labelledby="journey-title">
      <div className="dt-home-wrap dt-home-section">
        <div className="dt-home-section-head dt-home-section-head-centered">
          <h2 id="journey-title">{ui.journeyTitle}</h2>
          <p>{ui.journeyDescription}</p>
        </div>
        <div className="dt-home-journey-grid">
          {journeys.map((item) => (
            <a className="dt-home-journey" href={pageHref(item.slug)} key={item.slug}>
              <span className="dt-home-journey-icon"><JourneyIcon name={item.icon} /></span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  const renderDeveloperAccess = () => (
    <section className="dt-home-developer" aria-labelledby="developer-title">
      <div className="dt-home-wrap dt-home-section">
        <div className="dt-home-section-head dt-home-section-head-centered">
          <h2 id="developer-title">{ui.developerTitle}</h2>
          <p>{ui.developerDescription}</p>
        </div>
        <div className="dt-home-developer-grid">
          <a className="dt-home-developer-card" href={apiDocsHref}>
            <h3>Open API</h3>
            <p>{ui.apiDescription}</p>
            <span>{ui.apiLink}</span>
          </a>
          <a className="dt-home-developer-card dt-home-developer-card-featured" href={mcpDocsHref}>
            <h3>Sendify MCP</h3>
            <p>{ui.mcpDescription}</p>
            <span>{ui.mcpLink}</span>
          </a>
        </div>
      </div>
    </section>
  );

  const renderPopularArticles = () => (
    <section className="dt-home-popular" id="popular" aria-labelledby="popular-title">
      <div className="dt-home-wrap dt-home-section">
        <div className="dt-home-section-head">
          <div>
            <h2 id="popular-title">{t.pop_title}</h2>
            <p>{t.pop_sub}</p>
          </div>
          <a className="dt-home-text-link" href={productDocsHref}>{ui.allGuides}</a>
        </div>
        <div className="dt-home-art-grid">
          {arts.map((article, index) => (
            <a key={article.slug} className="dt-home-art" href={pageHref(article.slug)}>
              <span className="dt-home-art-index">{index + 1}.</span>
              <span className="dt-home-art-copy">
                <strong>{article.t}</strong>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );

  const renderSupport = () => (
    <section className="dt-home-support-wrap">
      <div className="dt-home-wrap dt-home-section">
        <div className="dt-home-support">
          <div className="dt-home-support-copy">
            <h2>{t.sup_title}</h2>
            <p>{t.sup_sub}</p>
          </div>
          <a className="dt-home-support-email" href={supportMail} aria-label={supportEmail}>
            <strong>{supportEmail}</strong>
          </a>
        </div>
      </div>
    </section>
  );

  const renderFooter = () => (
  <footer className="dt-home-site-footer" id="contact">
    <div className="dt-site-footer-shell">
      <div className="dt-site-footer-grid">
        <div><div className="dt-site-footer-title">Services</div><div className="dt-site-footer-links"><a href={helpCenterHref}>{ui.helpCenter}</a></div></div>
        <div><div className="dt-site-footer-title">Legal Agreements</div><div className="dt-site-footer-links">{legalLinks.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
            ))}</div></div>
        <div className="dt-site-footer-contact"><div className="dt-site-footer-title">Contact Us</div><div className="dt-site-footer-links">
          <a className="dt-site-footer-contact-link" href="mailto:dingstore_market@service.dingtalk.com"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4.5 7 7.5 6 7.5-6"></path></svg><span>Business Cooperation dingstore_market@service.dingtalk.com</span></a>
                    <a className="dt-site-footer-contact-link" href="mailto:sendify-support@dingmail.work"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4.5 7 7.5 6 7.5-6"></path></svg><span>Customer Support sendify-support@dingmail.work</span></a>
        </div></div>
      </div>
      <div className="dt-site-footer-meta">
        <div className="dt-site-footer-network" aria-label="Alibaba ecosystem"><span><a>DingTalk</a></span><span><a>Alibaba Group</a></span><span><a>Taobao</a></span><span><a>Tmall</a></span><span><a>Juhuasuan</a></span><span><a>AliExpress</a></span><span><a>Alibaba.com</a></span><span><a>1688</a></span><span><a>Alimama</a></span><span><a>Fliggy</a></span><span><a>Alibaba Cloud</a></span><span><a>AliOS</a></span><span><a>Alipay</a></span><span><a>Alipay Merchant Platform</a></span><span><a>UC</a></span><span><a>DAMO Academy</a></span><span><a>Alibaba Cloud Drive</a></span></div>
        <p className="dt-site-footer-copyright">DingTalk ©Copyright Notice © 2025 DingTalk (China) Information Technology Co., Ltd./or its affiliates. All rights reserved.</p>
      </div>
    </div>
  </footer>
  );

  return (
    <div ref={homeRef} className="dt-home dt-intl">
      <canvas ref={canvasRef} className="dt-home-hero-canvas" aria-hidden="true" />
      {renderHeader()}
      {renderHero()}
      {renderJourneys()}
      {renderDeveloperAccess()}
      {renderPopularArticles()}
      {renderSupport()}
      {renderFooter()}
    </div>
  );
};
