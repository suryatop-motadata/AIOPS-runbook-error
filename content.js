(() => {
  const SEARCH_FLAG = "__aiops_autosearch_done__";

  /*********************************
   * PART 1 – Usage Details Linking
   *********************************/
  function linkRunbookEntities() {
    const containers = document.querySelectorAll(
      'div[role="dialog"], .ant-modal-content, .k-window-content'
    );

    containers.forEach(container => {
      const rows = container.querySelectorAll("tr");

      rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) return;

        const type = cells[0].innerText.trim();
        const nameCell = cells[1];

        if (!nameCell || nameCell.dataset.aiopsLinked) return;
        if (type !== "Runbook Plugin") return;

        const name = nameCell.innerText.trim();
        if (!name) return;

        nameCell.dataset.aiopsLinked = "true";
        nameCell.style.cursor = "pointer";
        nameCell.style.color = "#40a9ff";
        nameCell.style.textDecoration = "underline";

        nameCell.onclick = () => {
          sessionStorage.removeItem(SEARCH_FLAG);
          const base = `${location.origin}/settings/plugin-library/runbooks`;
          const url = `${base}?aiops=${encodeURIComponent(name)}`;
          window.open(url, "_blank"); // open in new tab
        };
      });
    });
  }

  /*********************************
   * PART 2 – Runbook Auto Search
   *********************************/
  function autoFillRunbookSearch() {
    if (sessionStorage.getItem(SEARCH_FLAG) === "done") return;

    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("aiops");
    if (!keyword) return;

    const MAX_WAIT = 45000;
    const start = Date.now();

    const timer = setInterval(() => {
      const inputs = document.querySelectorAll(
        'div.row.ant-row-flex input.ant-input[placeholder="Search"]'
      );

      if (inputs.length) {
        const input = inputs[0];

        input.focus();
        input.value = keyword;

        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));

        sessionStorage.setItem(SEARCH_FLAG, "done");
        clearInterval(timer);
        return;
      }

      if (Date.now() - start > MAX_WAIT) {
        clearInterval(timer);
      }
    }, 500);
  }

  /*********************************
   * Observer – AIOps loads late
   *********************************/
  const observer = new MutationObserver(() => {
    linkRunbookEntities();
    autoFillRunbookSearch();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial run
  linkRunbookEntities();
  autoFillRunbookSearch();
})();