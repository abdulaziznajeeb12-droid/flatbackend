const SOCIETY_NAME = "MY BUILDING SOCIETY";

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

const formatMoney = value =>
  Number(value || 0).toLocaleString("en-PK");

function printHtml(inner) {
  document.getElementById("print-root")?.remove();
  document.getElementById("receipt-page-style")?.remove();

  const root = document.createElement("div");
  root.id = "print-root";
  root.innerHTML = inner;
  document.body.appendChild(root);

  // Receipt ki actual height calculate karein
  root.style.cssText = `
    display: block;
    position: absolute;
    left: -10000px;
    top: 0;
    width: 72mm;
    height: auto;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  `;

  const heightPx = root.getBoundingClientRect().height;
  const heightMm = Math.ceil(heightPx * 25.4 / 96) + 1;

  // Temporary custom page size
  const pageStyle = document.createElement("style");
  pageStyle.id = "receipt-page-style";
  pageStyle.textContent = `
    @page {
      size: 80mm ${heightMm}mm;
      margin: 0;
    }
  `;
  document.head.appendChild(pageStyle);

  root.style.cssText = "";

  document.body.classList.add("printing-receipt");

  let cleaned = false;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;

    document.body.classList.remove("printing-receipt");
    root.remove();
    pageStyle.remove();

    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  // Print dialog khulne se pehle layout settle hone dein
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });
}

// Fee receipt
export default function printReceipt(r) {
  printHtml(`
    <h3>${esc(SOCIETY_NAME)}</h3>
    <p>FEE RECEIPT</p>
    <hr>

    <div class="r">
      <span>Receipt #</span>
      <span>${esc(r.receiptNo)}</span>
    </div>

    <div class="r">
      <span>Date</span>
      <span>${esc(
        r.paidOn
          ? new Date(r.paidOn).toLocaleDateString("en-PK")
          : new Date().toLocaleDateString("en-PK")
      )}</span>
    </div>

    <div class="r">
      <span>Block / Flat</span>
      <span>${esc(r.blockName)} / ${esc(r.flatNo)}</span>
    </div>

    <div class="r">
      <span>Name</span>
      <span class="wrap">${esc(r.ownerName)}</span>
    </div>

    <hr>

    <div class="r">
      <span>${esc(r.feeType)}</span>
      <span>${esc(r.forMonth)}</span>
    </div>

    <div class="r">
      <span>Method</span>
      <span>${esc(r.method)}</span>
    </div>

    <hr>

    <div class="r b">
      <span>PAID</span>
      <span>Rs ${formatMoney(r.amount)}</span>
    </div>

    ${r.note ? `<hr><p class="note">${esc(r.note)}</p>` : ""}

    <hr>
    <p>Shukriya!</p>
  `);
}

// Worker salary slip
export function printSlip(s) {
  printHtml(`
    <h3>${esc(SOCIETY_NAME)}</h3>
    <p>SALARY SLIP</p>
    <hr>

    <div class="r">
      <span>Name</span>
      <span class="wrap">${esc(s.name)}</span>
    </div>

    <div class="r">
      <span>Role</span>
      <span>${esc(s.role || "-")}</span>
    </div>

    <div class="r">
      <span>Month</span>
      <span>${esc(s.forMonth)}</span>
    </div>

    <hr>

    <div class="r b">
      <span>PAID</span>
      <span>Rs ${formatMoney(s.amount)}</span>
    </div>

    <hr>
    <p>Signature: __________</p>
  `);
}

// Report slip
export function printReport({ title, subtitle, lines = [], total }) {
  const rows = lines.map(line =>
    typeof line === "string"
      ? `<hr><p class="center"><b>${esc(line)}</b></p>`
      : `<div class="r">
          <span class="wrap">${esc(line[0])}</span>
          <span>${esc(line[1])}</span>
        </div>`
  ).join("");

  printHtml(`
    <h3>${esc(SOCIETY_NAME)}</h3>
    <p>${esc(title)}</p>
    ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
    <hr>

    ${rows}

    ${total ? `
      <hr>
      <div class="r b">
        <span>${esc(total[0])}</span>
        <span>${esc(total[1])}</span>
      </div>
    ` : ""}

    <hr>
    <p>${new Date().toLocaleString("en-PK")}</p>
  `);
}