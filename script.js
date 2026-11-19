// portfolio buttons are the regular `.filter-button` elements (exclude project-only buttons)
const portfolioFilterButtons = document.querySelectorAll('.filter-button:not(.project-filter-button)');
const projectFilterButtons = document.querySelectorAll('.project-filter-button');
const galleryGrid = document.querySelector('.gallery-grid');
const projectGalleryGrid = document.querySelector('.project-gallery-grid');
const lightbox = document.querySelector('.lightbox');
const lightboxBackdrop = document.querySelector('.lightbox-backdrop');
const lightboxPanel = document.querySelector('.lightbox-panel');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
let galleryManifest = {};
let projectGalleryManifest = {};
let currentGalleryEntries = [];
let currentLightboxIndex = 0;

const normalizeGalleryManifestPaths = (manifest) => {
  Object.entries(manifest).forEach(([category, images]) => {
    manifest[category] = images.map((image) => {
      if (image.src.startsWith('portfolio/')) return image;
      return { ...image, src: `portfolio/${category}/${image.src.split('/').pop()}` };
    });
  });
  return manifest;
};

const renderGallery = (category) => {
  if (!galleryGrid) return;

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

const renderProjectGallery = (category) => {
  if (!projectGalleryGrid) return;

  projectGalleryGrid.innerHTML = '';
  const projectEntries = projectGalleryManifest[category] || [];

  if (!projectEntries.length) {
    projectGalleryGrid.innerHTML = '<p class="error-message">No project images found for this category.</p>';
    return;
  }

  currentGalleryEntries = projectEntries.map((item) => ({ ...item, category }));

  currentGalleryEntries.forEach((item, index) => {
    const article = document.createElement('article');
    article.className = 'gallery-item';
    article.dataset.category = item.category;
    article.innerHTML = `
      <img src="${item.src}" alt="${item.alt}" />
    `;
    article.addEventListener('click', () => {
      currentLightboxIndex = index;
      openLightbox(index);
    });
    projectGalleryGrid.appendChild(article);
  });
};

const buildProjectGalleryManifest = () => {
  projectGalleryManifest = {
    '4degrees': [
      { src: 'projects/4degrees/P01.jpg', alt: '4degrees P01', title: 'P01', subtitle: '4degrees project' },
      { src: 'projects/4degrees/P02.jpg', alt: '4degrees P02', title: 'P02', subtitle: '4degrees project' },
      { src: 'projects/4degrees/P03.jpg', alt: '4degrees P03', title: 'P03', subtitle: '4degrees project' }
    ],
    'emplooi': [
      { src: 'projects/emplooi/bb683996_Streetphotography_of_a_Catholic_nun_wearing_traditio_2edc7444-19ec-4d53-9bf0-f431cec42a63_2.png', alt: 'Emplooi project image 1', title: 'Emplooi 1', subtitle: 'Emplooi project' },
      { src: 'projects/emplooi/bb683996_Streetphotography_of_a_Catholic_nun_wearing_traditio_7e270c34-b755-440b-9b84-772633506036_1.png', alt: 'Emplooi project image 2', title: 'Emplooi 2', subtitle: 'Emplooi project' },
      { src: 'projects/emplooi/bb683996_Streetphotography_of_a_Catholic_nun_wearing_traditio_9b4d6318-e772-4045-8187-18d066fc5014_3.png', alt: 'Emplooi project image 3', title: 'Emplooi 3', subtitle: 'Emplooi project' },
      { src: 'projects/emplooi/bb683996_Streetphotography_of_a_Catholic_nun_wearing_traditio_f6ae25b8-9036-481a-b483-353616e7e9c0_2.png', alt: 'Emplooi project image 4', title: 'Emplooi 4', subtitle: 'Emplooi project' }
    ]
  };
};

const buildFallbackPortfolioManifest = () => {
  const filenames = {
    architecture: ['A01','A02','A03','A04','A05','A06','A07','A08','A09','A10','A12','A13','A15','A16','A17'],
    street: ['S01','S02','S03','S04','S05','S06','S07','S08','S09','S10','S1001','S11','S12','S13','S14','S15','S16','S17','S18','S19'],
    nature: ['N01','N02','N03','N04','N05','N06','N07','N08','N09','N0901','N10','N11','N13','N14','N15','N16','N17','S18','S19'],
    studio: ['S02','S03']
  };

  return Object.fromEntries(Object.entries(filenames).map(([category, names]) => [
    category,
    names.map((name) => ({
      src: `portfolio/${category}/${name}.jpg`,
      alt: name,
      title: name,
      subtitle: 'Portfolio image'
    }))
  ]));
};

const loadGalleryManifest = async () => {
  const manifestScript = document.getElementById('gallery-manifest');

  if (manifestScript) {
    try {
      galleryManifest = normalizeGalleryManifestPaths(JSON.parse(manifestScript.textContent));
      const forcedCategory = (document.body && document.body.dataset && document.body.dataset.category) || new URLSearchParams(location.search).get('category');
      const initialCategory = forcedCategory || 'architecture';
      // set active portfolio button if present
      portfolioFilterButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.filter === initialCategory);
      });
      renderGallery(initialCategory);
      buildProjectGalleryManifest();
      const initialProjectCategory = '4degrees';
      projectFilterButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.filter === initialProjectCategory);
      });
      renderProjectGallery(initialProjectCategory);
      return;
    } catch (error) {
      console.error('Failed to parse inline gallery manifest:', error);
    }
  }

  try {
    const response = await fetch('gallery-manifest.json');
    if (!response.ok) throw new Error('Could not load gallery manifest');

    galleryManifest = normalizeGalleryManifestPaths(await response.json());
    const forcedCategory = (document.body && document.body.dataset && document.body.dataset.category) || new URLSearchParams(location.search).get('category');
    const initialCategory = forcedCategory || 'architecture';
    portfolioFilterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === initialCategory);
    });
    renderGallery(initialCategory);
    buildProjectGalleryManifest();
    const initialProjectCategory = '4degrees';
    projectFilterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === initialProjectCategory);
    });
    renderProjectGallery(initialProjectCategory);
  } catch (error) {
    if (galleryGrid && document.getElementById('portfolio')) {
      galleryManifest = buildFallbackPortfolioManifest();
      portfolioFilterButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.filter === 'architecture');
      });
      renderGallery('architecture');
    }
    console.error(error);
  }
};

portfolioFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;

    portfolioFilterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    renderGallery(category);
  });
});

if (projectFilterButtons && projectFilterButtons.length) {
  projectFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      projectFilterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      renderProjectGallery(filter);
    });
  });
}

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

buildProjectGalleryManifest();
const initialProjectCategory = '4degrees';
if (projectGalleryGrid) {
  projectFilterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === initialProjectCategory);
  });
  renderProjectGallery(initialProjectCategory);
}

loadGalleryManifest();
