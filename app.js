const PRODUCTS = {
  diamonds: [
    { id: 'd100', name: '100 Diamants', detail: 'Un petit supplément', price: 800, tag: '' },
    { id: 'd310', name: '310 Diamants', detail: 'Pour votre prochaine grande partie', price: 2400, tag: 'POPULAIRE' },
    { id: 'd520', name: '520 Diamants', detail: 'Plus de liberté de jeu', price: 4000, tag: '' },
    { id: 'd1060', name: '1 060 Diamants', detail: 'Misez sur le plaisir', price: 8000, tag: 'MEILLEURE VALEUR' },
    { id: 'd2180', name: '2 180 Diamants', detail: 'Une vraie montée en niveau', price: 16000, tag: '' },
    { id: 'd5600', name: '5 600 Diamants', detail: 'Le grand paquet', price: 40000, tag: '' }
  ],
  membership: [
    { id: 'weekly', name: 'Abonnement hebdomadaire', detail: 'Une semaine d’avantages', price: 1590, tag: 'POPULAIRE' },
    { id: 'monthly', name: 'Abonnement mensuel', detail: 'Plus d’avantages, plus de jeu', price: 7990, tag: 'MEILLEURE VALEUR' },
    { id: 'weekly-lite', name: 'Hebdomadaire léger', detail: 'Une option hebdomadaire légère', price: 890, tag: '' },
    { id: 'monthly-lite', name: 'Mensuel léger', detail: 'Un peu plus chaque jour', price: 3990, tag: '' }
  ]
};

const grid = document.querySelector('#product-grid');
const cart = new Map();
let category = 'diamonds';
const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'HTG', maximumFractionDigits: 0 });

function formatPrice(price) {
  return currency.format(price).replace(/G/g, ' G');
}

function renderProducts() {
  grid.innerHTML = PRODUCTS[category].map((product) => `
    <article class="product-card">
      ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
      <span class="product-symbol" aria-hidden="true">${category === 'diamonds' ? '◆' : '✳'}</span>
      <h3>${product.name}</h3>
      <p class="product-detail">${product.detail}</p>
      <div class="product-bottom"><span class="product-price">${formatPrice(product.price)}</span><button class="add-button" data-add="${product.id}" aria-label="Ajouter ${product.name} au panier">+</button></div>
    </article>`).join('');
  grid.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => addToCart(button.dataset.add)));
}

function findProduct(id) {
  return Object.values(PRODUCTS).flat().find(product => product.id === id);
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  openCart();
}

function renderCart() {
  const items = [...cart.entries()];
  const quantity = items.reduce((sum, [, count]) => sum + count, 0);
  const total = items.reduce((sum, [id, count]) => sum + findProduct(id).price * count, 0);
  document.querySelector('#cart-count').textContent = quantity;
  document.querySelector('#drawer-item-count').textContent = `(${quantity})`;
  document.querySelector('#cart-empty').hidden = quantity > 0;
  document.querySelector('#cart-summary').hidden = quantity === 0;
  document.querySelector('#cart-items').innerHTML = items.map(([id, count]) => {
    const product = findProduct(id);
    return `<article class="cart-line"><div><h3>${product.name}</h3><p>Qté ${count} · ${formatPrice(product.price)} chacun</p></div><div class="cart-line-right"><strong>${formatPrice(product.price * count)}</strong><button class="remove-button" data-remove="${id}">Retirer</button></div></article>`;
  }).join('');
  document.querySelector('#cart-subtotal').textContent = formatPrice(total);
  document.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
    cart.delete(button.dataset.remove);
    renderCart();
  }));
  document.querySelector('#order-preview').innerHTML = `${items.map(([id, count]) => `${findProduct(id).name} × ${count}`).join('<br>')}<br><strong>Total exemple : ${formatPrice(total)}</strong>`;
}

function openCart() {
  document.querySelector('#cart-drawer').classList.add('open');
  document.querySelector('#cart-drawer').setAttribute('aria-hidden', 'false');
  document.querySelector('#drawer-backdrop').hidden = false;
  document.body.classList.add('drawer-open');
}

function closeCart() {
  document.querySelector('#cart-drawer').classList.remove('open');
  document.querySelector('#cart-drawer').setAttribute('aria-hidden', 'true');
  document.querySelector('#drawer-backdrop').hidden = true;
  document.body.classList.remove('drawer-open');
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(item => {
    item.classList.toggle('active', item === tab);
    item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
  });
  category = tab.dataset.category;
  renderProducts();
}));

document.querySelector('#region-select').addEventListener('change', renderProducts);
document.querySelector('#cart-trigger').addEventListener('click', openCart);
document.querySelector('#close-cart').addEventListener('click', closeCart);
document.querySelector('#drawer-backdrop').addEventListener('click', closeCart);
document.querySelector('#continue-shopping').addEventListener('click', closeCart);
document.querySelector('#checkout-button').addEventListener('click', () => {
  closeCart();
  document.querySelector('#form-message').textContent = '';
  document.querySelector('#form-message').className = 'form-message';
  document.querySelector('#checkout-dialog').showModal();
});
document.querySelector('#checkout-form').addEventListener('submit', event => {
  event.preventEvent();
  if (!event.currentTarget.reportValidity()) return;
  const form = new FormData(event.currentTarget);
  const message = document.querySelector('#form-message');
  message.className = 'form-message success';
  message.textContent = `Démonstration terminée pour l'identifiant joueur ${form.get('playerId')}. Aucun achat n'a été effectué et aucun paiement n'a été prélevé.`;
});
document.querySelector('#checkout-form').addEventListener('click', event => {
  if (event.target.classList.contains('dialog-close')) document.querySelector('#checkout-dialog').close();
});
document.querySelector('#year').textContent = new Date().getFullYear();
renderProducts();
renderCart();
