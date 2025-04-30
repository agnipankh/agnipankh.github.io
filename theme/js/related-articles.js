// Related Articles JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Only run on article pages
  const articleContent = document.querySelector('.post-content');
  if (!articleContent) return;

  // Get the current category
  const categoryElement = document.querySelector('.post-info .post-count');
  if (!categoryElement) return;

  const currentCategory = categoryElement.textContent.trim();
  const currentPath = window.location.pathname;

  console.log('Setting up related articles for category:', currentCategory);

  // Create and insert the related articles section
  const relatedSection = document.createElement('section');
  relatedSection.className = 'related-articles';
  relatedSection.innerHTML = `
    <h3 class="related-articles-title">More from ${currentCategory}</h3>
    <div class="related-articles-grid"></div>
  `;

  // Find where to insert - after post-nav
  const postNav = document.querySelector('.post-nav');
  if (!postNav || !postNav.parentNode) {
    console.log('Could not find post-nav element');
    return;
  }
  postNav.parentNode.insertBefore(relatedSection, postNav.nextSibling);

  const grid = relatedSection.querySelector('.related-articles-grid');

  // Fetch category page
  console.log('Fetching category page:', `/category/${currentCategory.toLowerCase()}.html`);
  fetch(`/category/${currentCategory.toLowerCase()}.html`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch category page: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Find articles
      let articleCards = [];

      // Try different selectors for finding article cards
      const trySelectors = [
        '.post-card',
        '.article-card',
        'article.post',
        '.post',
        '.post-item'
      ];

      for (const selector of trySelectors) {
        const cards = doc.querySelectorAll(selector);
        if (cards.length > 0) {
          console.log(`Found ${cards.length} articles using selector '${selector}'`);
          articleCards = Array.from(cards);
          break;
        }
      }

      // If we still don't have any cards, try a more generic approach
      if (articleCards.length === 0) {
        console.log('Trying to find articles using links...');
        const links = doc.querySelectorAll('a[href*=".html"]:not([href*="/category/"]):not([href*="/tag/"])');
        const cardElements = new Set();

        for (const link of links) {
          let parent = link.parentElement;
          for (let i = 0; i < 3 && parent; i++) {
            if (parent.tagName === 'ARTICLE' ||
                parent.classList.contains('post') ||
                parent.classList.contains('post-card') ||
                parent.classList.contains('article')) {
              cardElements.add(parent);
              break;
            }
            parent = parent.parentElement;
          }
        }

        articleCards = Array.from(cardElements);
        console.log(`Found ${articleCards.length} articles using link traversal`);
      }

      // Filter out current article
      articleCards = articleCards.filter(card => {
        const links = card.querySelectorAll('a');
        for (const link of links) {
          if (link.href && link.href.includes(currentPath)) {
            return false;
          }
        }
        return true;
      });

      console.log(`Found ${articleCards.length} related articles (excluding current)`);

      // Randomize and limit
      articleCards = articleCards
        .sort(() => 0.5 - Math.random())
        .slice(0, 15);

      if (articleCards.length === 0) {
        console.log('No related articles after filtering');
        relatedSection.remove();
        return;
      }

      // Create article cards
      articleCards.forEach((card, index) => {
        // Get title
        let title = '';
        const titleSelectors = ['.post-card-title', '.article-title', 'h1', 'h2', 'h3', '.entry-title'];

        for (const selector of titleSelectors) {
          const titleEl = card.querySelector(selector);
          if (titleEl) {
            title = titleEl.textContent.trim();
            break;
          }
        }

        if (!title) {
          console.log(`Could not find title for article ${index}`);
          return;
        }

        // Get link
        let url = '';
        const links = card.querySelectorAll('a');
        for (const link of links) {
          if (link.href && link.href.includes('.html') &&
              !link.href.includes('/category/') &&
              !link.href.includes('/tag/')) {
            url = link.href;
            break;
          }
        }

        if (!url) {
          console.log(`Could not find URL for article: ${title}`);
          return;
        }

        // Get image
        let image = null;
        const img = card.querySelector('img');
        if (img && img.src) {
          image = img.src;
        }

        console.log(`Creating card for article: ${title}`);

        // Build card
        const cardEl = document.createElement('div');
        cardEl.className = 'related-article-card';

        const link = document.createElement('a');
        link.href = url;
        link.className = 'related-article-link';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'related-article-image';

        if (image) {
          const imgEl = document.createElement('img');
          imgEl.src = image;
          imgEl.alt = title;
          imageDiv.appendChild(imgEl);
        } else {
          const noImageDiv = document.createElement('div');
          noImageDiv.className = 'related-article-no-image';
          noImageDiv.innerHTML = '<span class="icon icon-image"></span>';
          imageDiv.appendChild(noImageDiv);
        }

        const titleEl = document.createElement('h4');
        titleEl.className = 'related-article-title';
        titleEl.textContent = title;

        link.appendChild(imageDiv);
        link.appendChild(titleEl);
        cardEl.appendChild(link);
        grid.appendChild(cardEl);
      });

      console.log('Related articles loaded successfully');
    })
    .catch(error => {
      console.error('Error loading related articles:', error);
      relatedSection.remove();
    });
});
