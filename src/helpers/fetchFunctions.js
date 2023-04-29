const BASE_URL = [
  'https://api.mercadolibre.com/sites/MLB/search?',
  'https://api.mercadolibre.com/items/',
  'https://api.mercadolibre.com/sites/MLB/categories',
];

export const fetchProduct = async (id) => {
  if (!id) throw new Error('ID não informado');
  return (await fetch(`${BASE_URL[1]}${id}`)).json();
};

export const fetchProductsList = async (query, altSearch) => {
  if (!query) throw new Error('Termo de busca não informado');
  return (await (await fetch(`${BASE_URL[0]}${altSearch}=${query}`)).json()).results;
};

export const fetchCategories = async () => (await fetch(BASE_URL[2])).json();
