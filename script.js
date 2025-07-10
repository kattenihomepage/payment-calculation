// 初期データ
let members = []; // デフォルトなし
let payments = [];

// DOM要素
const membersList = document.getElementById('members-list');
const paymentsList = document.getElementById('payments-list');
const settlementsList = document.getElementById('settlements-list');

const addMemberBtn = document.getElementById('add-member-btn');
const newMemberName = document.getElementById('new-member-name');
const addPaymentBtn = document.getElementById('add-payment-btn');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalSaveBtn = document.getElementById('modal-save-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');

// メンバー追加
addMemberBtn.onclick = () => {
  const name = newMemberName.value.trim();
  if (name) {
    const id = Date.now().toString();
    members.push({ id, name });
    newMemberName.value = '';
    renderMembers();
    renderSettlements();
  }
};

// 支払い追加（モーダル表示）
addPaymentBtn.onclick = () => {
  openPaymentModal();
};

// 表示更新
function renderMembers() {
  membersList.innerHTML = '';
  members.forEach(m => {
    const div = document.createElement('div');
    div.className = 'tile';
    div.textContent = m.name;
    membersList.appendChild(div);
  });
}

function renderPayments() {
  paymentsList.innerHTML = '';
  payments.forEach(p => {
    const m = members.find(m => m.id === p.memberId);
    const div = document.createElement('div');
    div.className = 'tile';
    div.innerHTML = `<strong>${p.description || '(内容なし)'}</strong><br>
      支払者: ${m ? m.name : '不明'}<br>
      金額: ${p.amount}円`;
    paymentsList.appendChild(div);
  });
}

function renderSettlements() {
  settlementsList.innerHTML = '';
  if (members.length === 0 || payments.length === 0) return;

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const avg = total / members.length;
  const paid = {};
  members.forEach(m => paid[m.id] = 0);
  payments.forEach(p => paid[p.memberId] += p.amount);

  const diffs = members.map(m => ({
    id: m.id,
    name: m.name,
    diff: paid[m.id] - avg
  }));

  // 簡易分配計算（正確な最適化ロジックは後日実装予定）
  diffs.forEach(d => {
    const div = document.createElement('div');
    div.className = 'tile';
    div.textContent = `${d.name}: ${d.diff >=0 ? '受取' : '支払'} ${Math.abs(Math.round(d.diff))}円`;
    settlementsList.appendChild(div);
  });
}

// モーダル表示
function openPaymentModal() {
  modalTitle.textContent = '支払い追加';
  modalBody.innerHTML = '';

  // メンバー選択
  const memberSelect = document.createElement('select');
  members.forEach(m => {
    const option = document.createElement('option');
    option.value = m.id;
    option.textContent = m.name;
    memberSelect.appendChild(option);
  });
  modalBody.appendChild(memberSelect);

  // 内容
  const descInput = document.createElement('input');
  descInput.type = 'text';
  descInput.placeholder = '内容（任意）';
  modalBody.appendChild(descInput);

  // 金額
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.placeholder = '金額（必須）';
  modalBody.appendChild(amountInput);

  modalSaveBtn.onclick = () => {
    const memberId = memberSelect.value;
    const description = descInput.value.trim();
    const amount = parseInt(amountInput.value);
    if (!memberId || !amount) {
      alert('支払者と金額は必須です');
      return;
    }
    payments.push({
      id: Date.now().toString(),
      memberId,
      description,
      amount
    });
    closeModal();
    renderPayments();
    renderSettlements();
  };

  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

modalCloseBtn.onclick = closeModal;

// 初期描画
renderMembers();
renderPayments();
renderSettlements();
