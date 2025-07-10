// 初期データ
let members = [];
let payments = [];

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

let editingMemberId = null;

// メンバー追加
addMemberBtn.onclick = () => {
  const name = newMemberName.value.trim();
  if (!name) {
    alert('メンバー名を入力してください');
    return;
  }
  const id = Date.now().toString();
  members.push({ id, name });
  newMemberName.value = '';
  renderMembers();
  renderSettlements();
};

// 支払い追加・編集用共通モーダル
function openPaymentModal(payment = null) {
  modalTitle.textContent = payment ? '支払い編集' : '支払い追加';
  modalBody.innerHTML = '';

  if (members.length === 0) {
    alert('先にメンバーを追加してください');
    return;
  }

  // メンバー選択
  const memberSelect = document.createElement('select');
  members.forEach(m => {
    const option = document.createElement('option');
    option.value = m.id;
    option.textContent = m.name;
    if (payment && m.id === payment.memberId) option.selected = true;
    memberSelect.appendChild(option);
  });
  modalBody.appendChild(memberSelect);

  // 内容入力
  const descInput = document.createElement('input');
  descInput.type = 'text';
  descInput.placeholder = '内容（任意）';
  descInput.value = payment ? payment.description : '';
  modalBody.appendChild(descInput);

  // 金額入力
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.placeholder = '金額（必須）';
  amountInput.value = payment ? payment.amount : '';
  modalBody.appendChild(amountInput);

  modalSaveBtn.onclick = () => {
    const memberId = memberSelect.value;
    const description = descInput.value.trim();
    const amount = parseInt(amountInput.value);
    if (!memberId || !amount || amount <= 0) {
      alert('支払者と正しい金額を入力してください');
      return;
    }

    if (payment) {
      // 編集モード
      const index = payments.findIndex(p => p.id === payment.id);
      if (index !== -1) {
        payments[index].memberId = memberId;
        payments[index].description = description;
        payments[index].amount = amount;
      }
    } else {
      // 追加モード
      payments.push({
        id: Date.now().toString(),
        memberId,
        description,
        amount
      });
    }
    closeModal();
    renderPayments();
    renderSettlements();
    renderMembers();  // 追加：支払い変化でメンバー削除ボタン状態も更新
  };

  modal.classList.remove('hidden');
}

// 支払い追加ボタン
addPaymentBtn.onclick = () => {
  openPaymentModal();
};

// メンバー表示更新
function renderMembers() {
  membersList.innerHTML = '';
  members.forEach(m => {
    const div = document.createElement('div');
    div.className = 'tile';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = m.name;
    nameSpan.className = 'name';
    div.appendChild(nameSpan);

    // 編集ボタン
    const editBtn = document.createElement('button');
    editBtn.textContent = '編集';
    editBtn.onclick = () => openEditMemberModal(m);
    div.appendChild(editBtn);

    // 削除ボタン（支払いに使用中は無効化）
    const usedInPayments = payments.some(p => p.memberId === m.id);
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.disabled = usedInPayments;
    deleteBtn.onclick = () => {
      if (confirm(`「${m.name}」を削除しますか？`)) {
        members = members.filter(x => x.id !== m.id);
        renderMembers();
        renderSettlements();
      }
    };
    div.appendChild(deleteBtn);

    membersList.appendChild(div);
  });
}

// 支払い表示更新（編集・削除ボタン付き）
function renderPayments() {
  paymentsList.innerHTML = '';
  payments.forEach(p => {
    const m = members.find(m => m.id === p.memberId);
    const div = document.createElement('div');
    div.className = 'tile';

    const descHtml = `<strong>${p.description || '(内容なし)'}</strong><br>
      支払者: ${m ? m.name : '不明'}<br>
      金額: ${p.amount}円`;
    div.innerHTML = descHtml;

    // 編集ボタン
    const editBtn = document.createElement('button');
    editBtn.textContent = '編集';
    editBtn.onclick = () => openPaymentModal(p);
    div.appendChild(editBtn);

    // 削除ボタン
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.onclick = () => {
      if (confirm('この支払いを削除しますか？')) {
        payments = payments.filter(pay => pay.id !== p.id);
        renderPayments();
        renderSettlements();
        renderMembers();  // 追加：支払い削除でメンバー削除ボタンの状態更新
      }
    };
    div.appendChild(deleteBtn);

    paymentsList.appendChild(div);
  });
}

// 受け渡し表示更新（支払う人→受け取る人 : 金額）
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

  // 支払う人（負債）と受け取る人（債権）に分ける
  const payers = diffs.filter(d => d.diff < 0).map(d => ({ ...d, diff: -d.diff })).sort((a,b) => a.diff - b.diff);
  const receivers = diffs.filter(d => d.diff > 0).sort((a,b) => b.diff - a.diff);

  let i = 0;
  let j = 0;

  while(i < payers.length && j < receivers.length) {
    const payer = payers[i];
    const receiver = receivers[j];
    const amount = Math.min(payer.diff, receiver.diff);

    if (amount > 0) {
      const div = document.createElement('div');
      div.className = 'tile';
      div.textContent = `${payer.name} → ${receiver.name} : ${Math.round(amount)}円`;
      settlementsList.appendChild(div);
    }

    payer.diff -= amount;
    receiver.diff -= amount;

    if (payer.diff === 0) i++;
    if (receiver.diff === 0) j++;
  }
}

// 名前編集モーダルを開く
function openEditMemberModal(member) {
  editingMemberId = member.id;
  modalTitle.textContent = 'メンバー名編集';
  modalBody.innerHTML = '';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = member.name;
  input.id = 'edit-member-name-input';
  modalBody.appendChild(input);

  modalSaveBtn.onclick = () => {
    const newName = input.value.trim();
    if (!newName) {
      alert('名前を入力してください');
      return;
    }
    const index = members.findIndex(m => m.id === editingMemberId);
    if (index !== -1) {
      members[index].name = newName;
      renderMembers();
      renderSettlements();
      closeModal();
    }
  };

  modal.classList.remove('hidden');
}

// モーダルを閉じる
function closeModal() {
  modal.classList.add('hidden');
}

modalCloseBtn.onclick = closeModal;

// 初期描画
renderMembers();
renderPayments();
renderSettlements();
