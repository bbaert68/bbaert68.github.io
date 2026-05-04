const filterButtons = document.querySelectorAll('.filter-button');
const galleryGrid = document.querySelector('.gallery-grid');
const lightbox = document.querySelector('.lightbox');
const lightboxBackdrop = document.querySelector('.lightbox-backdrop');
const lightboxPanel = document.querySelector('.lightbox-panel');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
let galleryManifest = {};
let currentGalleryEntries = [];
let currentLightboxIndex = 0;

const renderGallery = (category) => {
  galleryGrid.innerHTML = '';

  currentGalleryEntries = category === 'all'
    ? Object.entries(galleryManifest).flatMap(([currentCategory, images]) =>
        images.map((image) => ({ ...image, category: currentCategory }))
      )
    : (galleryManifest[category] || []).map((image) => ({ ...image, category }));

  if (currentGalleryEntries.length === 0) {
    galleryGrid.innerHTML = '<p class="error-message">No images found for this category.</p>';
    return;
  }

  currentGalleryEntries.forEach((item, index) => {
    const article = document.createElement('article');
    article.className = 'gallery-item';
    article.dataset.category = item.category;
    article.innerHTML = `
      <img src="${item.src}" alt="${item.alt}" />
    `;
    article.addEventListener('click', () => openLightbox(index));
    galleryGrid.appendChild(article);
  });
};

const showLightboxItem = (item) => {
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
};

const openLightbox = (index) => {
  currentLightboxIndex = index;
  showLightboxItem(currentGalleryEntries[currentLightboxIndex]);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
};

const showPrevious = () => {
  if (!currentGalleryEntries.length) return;
  currentLightboxIndex = (currentLightboxIndex - 1 + currentGalleryEntries.length) % currentGalleryEntries.length;
  showLightboxItem(currentGalleryEntries[currentLightboxIndex]);
};

const showNext = () => {
  if (!currentGalleryEntries.length) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % currentGalleryEntries.length;
  showLightboxItem(currentGalleryEntries[currentLightboxIndex]);
};

const loadGalleryManifest = async () => {
  const manifestScript = document.getElementById('gallery-manifest');

  if (manifestScript) {
    try {
      galleryManifest = JSON.parse(manifestScript.textContent);
      renderGallery('all');
      return;
    } catch (error) {
      console.error('Failed to parse inline gallery manifest:', error);
    }
  }

  try {
    const response = await fetch('gallery-manifest.json');
    if (!response.ok) throw new Error('Could not load gallery manifest');

    galleryManifest = await response.json();
    renderGallery('all');
  } catch (error) {
    galleryGrid.innerHTML = '<p class="error-message">Could not load gallery manifest. Run a local server and verify gallery-manifest.json exists.</p>';
    console.error(error);
  }
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    renderGallery(category);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', (event) => {
  event.stopPropagation();
  showPrevious();
});
lightboxNext.addEventListener('click', (event) => {
  event.stopPropagation();
  showNext();
});

window.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('open')) return;
  if (event.key === 'Escape') {
    closeLightbox();
  }
  if (event.key === 'ArrowLeft') {
    showPrevious();
  }
  if (event.key === 'ArrowRight') {
    showNext();
  }
});

loadGalleryManifest();
