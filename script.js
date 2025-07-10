// 初期データ
let members = [
    { id: '1', name: '田中太郎' },
    { id: '2', name: '鈴木花子' },
  ];
  
  let payments = [
    { id: '1', memberId: '1', amount: 1000, description: 'ランチ代' },
    { id: '2', memberId: '2', amount: 1800, description: '映画代' },
  ];
  
  // DOM要素
  const membersList = document.getElementById('members-list');
  const paymentsList = document.getElementById('payments-list');
  const settlementsList = document.getElementById('settlements-list');
  
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalSaveBtn = document.getElementById('modal-save-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  
  // 表示更新
  function renderMembers() {
    membersList.innerHTML = '';
    members.forEach(m => {
      const div = document.createElement('div');
      div.textContent = m.name;
      membersList.appendChild(div);
    });
  }
  
  function renderPayments() {
    paymentsList.innerHTML = '';
    payments.forEach(p => {
      const m = members.find(m => m.id === p.memberId);
      const div = document.createElement('div');
      div.innerHTML = `<strong>${p.description}</strong> ${p.amount}円<br>支払者: ${m ? m.name : '不明'}`;
      paymentsList.appendChild(div);
    });
  }
  
  function renderSettlements() {
    settlementsList.innerHTML = '';
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const avg = total / members.length;
    const paid = {};
    members.forEach(m => paid[m.id] = 0);
    payments.forEach(p => paid[p.memberId] += p.amount);
  
    members.forEach(m => {
      const diff = paid[m.id] - avg;
      const div = document.createElement('div');
      div.textContent = `${m.name}: ${diff > 0 ? '受取' : '支払'} ${Math.abs(diff)}円`;
      settlementsList.appendChild(div);
    });
  }
  
  // モーダル制御（簡易）
  modalCloseBtn.onclick = () => { modal.classList.add('hidden'); };
  
  // 初期描画
  renderMembers();
  renderPayments();
  renderSettlements();
  