const BASE_URL = ['https://brasilapi.com.br/api/cep/v2/', 'https://cep.awesomeapi.com.br/json/'];
const cartAddress = document.querySelector('.cart__address');

export const getAddress = async (cep) => (await Promise.any(
  BASE_URL.map(async (url) => (fetch(`${url}${cep}`))),
)).json();

export const searchCep = async (cep) => {
  try {
    const objAddress = await getAddress(cep);
    if (!objAddress.address && !objAddress.street) throw new Error('CEP não encontrado');
    const street = objAddress.address ?? objAddress.street;
    const district = objAddress.district ?? objAddress.neighborhood;
    cartAddress
      .innerHTML = `${street} - ${district} - ${objAddress.city} - ${objAddress.state}`;
  } catch (error) {
    console.error(error);
    cartAddress.innerHTML = 'CEP não encontrado';
  }
};
