import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let page = 1;
let value = '';
const KEY = '29793314-743de119c0854ddcec0742bc8';
const BASE_URL = 'https://pixabay.com/api/';
const BASE_OPTIONS =
  '&image_type=photo&orientation=horizontal&safesearch=true&per_page=40';

const formEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

const getCards = async (query, page) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/?key=${KEY}&q=${query}${BASE_OPTIONS}&page=${page}`
    );
    return response;
  } catch (er) {
    console.log(er.message);
  }
};

const submitFormHandler = async evt => {
  evt.preventDefault();

  value = evt.currentTarget.elements.searchQuery.value.trim();
  page = 1;

  if (!loadMoreBtnEl.classList.contains('is-hidden')) {
    loadMoreBtnEl.classList.add('is-hidden');
  }

  try {
    const res = await getCards(value, page);
    if (res.status !== 200) {
      throw new Error();
    }
    if (res.data.totalHits > 0) {
      Notify.success(`Hooray! We found ${res.data.totalHits} images.`);
    }
    const cards = await res.data.hits;
    renderCards(cards);
  } catch (er) {
    console.log(er.message);
  }
  lightbox.refresh();
};

const cardTemplate = cards => {
  const cardsStr = cards
    .map(
      card =>
        `<a class="gallery__img" href="${card.largeImageURL}">
        <div class="photo-card">  
    <img class="gallery__prewiev" src="${card.webformatURL}" alt="${card.tags}" title=""/>
    
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${card.likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${card.views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${card.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${card.downloads}
    </p>
  </div>
</div></a>`
    )
    .join('');
  return cardsStr;
};

const renderCards = cards => {
  if (cards.length < 1) {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  loadMoreBtnEl.classList.remove('is-hidden');
  galleryEl.innerHTML = '';

  galleryEl.insertAdjacentHTML('beforeend', cardTemplate(cards));
};

const loadMoreCards = cards => {
  galleryEl.insertAdjacentHTML('beforeend', cardTemplate(cards));
};

const loadMoreCardsHandler = async () => {
  page += 1;
  try {
    const res = await getCards(value, page);
    if (res.status !== 200) {
      throw new Error();
    }
    const cards = await res.data.hits;
    loadMoreCards(cards);
    if (res.data.totalHits / 40 < page) {
      loadMoreBtnEl.classList.add('is-hidden');
      throw new Error();
    }
  } catch (er) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    console.log(er);
    loadMoreBtnEl.classList.add('is-hidden');
  }
  lightbox.refresh();
};

formEl.addEventListener('submit', submitFormHandler);
loadMoreBtnEl.addEventListener('click', loadMoreCardsHandler);

var lightbox = new SimpleLightbox('.gallery a');
