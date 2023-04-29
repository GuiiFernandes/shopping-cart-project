import 'bootstrap/dist/css/bootstrap.min.css';
import { searchCep } from './helpers/cepFunctions';
import { fetchCategories, fetchProduct,
  fetchProductsList } from './helpers/fetchFunctions';
import { createProductElement, createCartProductElement } from './helpers/shopFunctions';
import './style.css';
import { saveCartID, getSavedCartIDs } from './helpers/cartFunctions';

const elProducts = document.querySelector('.products');
const carrinho = document.querySelector('ol.cart__products');
const totalPrice = document.querySelector('.total-price');
const countItens = document.querySelector('.count-itens');
const cartButton = document.querySelector('.container-cartTitle');
const form = document.querySelector('.input-group');
const logo = document.querySelector('.container-title');
const labelSearch = document.getElementById('input-label');
const inputSearch = document.getElementById('search');
const containerCat = document.getElementById('container-categories');
const listCat = document.getElementById('list-categories');
const cart = document.querySelector('.cart');
const widthWinCart = 900;
const maxWidth = 550;
const stringsSearch = ['category', 'q'];

const loading = (status) => (status
  ? `<section class="loading">
        <button class="btn" type="button" disabled>
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true">
          </span>
          Carregando...
        </button>
      </section>`
  : '');

const totalUpdate = () => {
  const ProductsCart = document.querySelectorAll('.cart__product__info-container');
  const arrayProducts = [...ProductsCart];
  totalPrice.innerHTML = arrayProducts
    .reduce((sum, ccur, index) => {
      const value = Number(ProductsCart[index].lastChild.lastChild.innerText);
      return sum + value;
    }, 0).toFixed(2);
};

const countCart = () => {
  const cartProducts = document.querySelectorAll('.cart__product__info-container');
  if (cartProducts.length) {
    countItens.innerHTML = cartProducts.length;
    countItens.style.display = 'block';
  } else {
    countItens.innerHTML = 0;
    countItens.style.display = 'none';
    cart.style.display = 'none';
    elProducts.style.marginRight = '0';
  }
};

const recoveryCart = async () => {
  const cartSaved = getSavedCartIDs();
  const cartProductDetails = await Promise.all(
    cartSaved.map(async (productId) => fetchProduct(productId)),
  );
  cartProductDetails.forEach((product) => {
    carrinho.appendChild(createCartProductElement(product));
  });
  totalUpdate();
  countCart();
};

const createErroElem = (error) => {
  elProducts.innerHTML = `<section class="error">
  ${error.message}. Recarregue a página ou tente novamente!
  </section>`;
  console.error(error);
};

const loadCategList = async () => {
  const categories = await fetchCategories();
  listCat.innerHTML = '';
  categories.forEach(({ id, name }) => {
    listCat.innerHTML += `<li class="category">${name}
    <span class="id-category">${id}</span></li>`;
  });
};

const addInPreferences = (key) => {
  let historyNav = JSON.parse(localStorage.getItem('preferences'));
  if (historyNav) {
    historyNav[key] = historyNav[key] ? historyNav[key] + 1 : 1;
  } else {
    historyNav = { [key]: 1 };
  }
  localStorage.setItem('preferences', JSON.stringify(historyNav));
};

const randomCategory = (max) => Math.round(Math.random() * max);

const searchProducts = async (value = 'computador', altSearch) => {
  elProducts.innerHTML = loading(true);
  const products = await fetchProductsList(value, altSearch);
  elProducts.innerHTML = loading(false);
  if (!products.length) throw new Error('Busca inválida! Item não encontrado/existe');
  products.forEach((product) => elProducts
    .appendChild(createProductElement(product)));
};

const addProduct = async (elem) => {
  const productId = elem.parentNode.firstChild.innerText;
  saveCartID(productId);
  const productDetails = await fetchProduct(productId);
  addInPreferences(productDetails.category_id);
  carrinho.appendChild(createCartProductElement(productDetails));
};

(async function initial() {
  try {
    await loadCategList();
    const historyNav = JSON.parse(localStorage.getItem('preferences'));
    let query;
    if (historyNav) {
      query = Object.entries(historyNav)
        .reduce((biggest, [key, value]) => (value > biggest[1]
          ? [key, value] : biggest), ['', 0])[0];
    } else {
      const idCategories = document.getElementsByClassName('id-category');
      const randomIndex = randomCategory(idCategories.length - 1);
      query = idCategories[randomIndex].innerText;
    }
    const indexQuery = (query.includes('MLB') ? 0 : 1);
    await searchProducts(query, stringsSearch[indexQuery]);
    await recoveryCart();
  } catch (error) {
    createErroElem(error);
  }
}());

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const { value } = document.getElementById('search');
    await searchProducts(value, stringsSearch[1]);
    addInPreferences(value);
  } catch (error) {
    createErroElem(error);
  }
});

document.addEventListener('click', async (event) => {
  const elem = event.target;
  if (elem.classList.contains('product__add')) {
    await addProduct(elem);
  }
  if (elem.classList.contains('category')) {
    await searchProducts(elem.lastChild.innerText, stringsSearch[0]);
    addInPreferences(elem.lastChild.innerText);
    containerCat.style.display = 'none';
  } else {
    totalUpdate();
    countCart();
  }
});

document.querySelector('.cep-button').addEventListener('click', async () => {
  const { value } = document.querySelector('.cep-input');
  await searchCep(value);
});

cartButton.addEventListener('click', () => {
  const condition = cart.style.display === 'none';
  const count = Number(countItens.innerText);
  if (count) {
    cart.style.display = (condition ? 'flex' : 'none');
    if (window.innerWidth > widthWinCart) {
      elProducts.style.marginRight = (!condition ? '0' : `${cart.clientWidth}px`);
    } else {
      containerCat.style.display = (containerCat.style.display !== 'none' && 'none');
    }
  }
});

logo.addEventListener('click', () => {
  const condition = containerCat.style.display === 'none';
  containerCat.style.display = (condition ? 'block' : 'none');
  if (window.innerWidth > widthWinCart) {
    elProducts.style.marginLeft = (!condition ? '0' : `${containerCat.clientWidth}px`);
  } else {
    cart.style.display = (cart.style.display !== 'none' && 'none');
  }
});

labelSearch.addEventListener('click', () => {
  if (window.innerWidth <= maxWidth) {
    const conditionWidth = (inputSearch.style.display === 'none'
      || !inputSearch.style.display);
    inputSearch.style.display = (conditionWidth ? 'block' : 'none');
    logo.style.display = (inputSearch.style.display === 'none' ? 'block' : 'none');
  }
});

window.addEventListener('resize', () => {
  const conditionWidth = window.innerWidth > maxWidth;
  inputSearch.style.display = (conditionWidth ? 'block' : 'none');
  logo.style.display = 'block';
});
