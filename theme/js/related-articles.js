// Related Articles JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Check if there's already a related articles section
  // (prevents duplicate sections if script is included twice)
  if (document.querySelector('.related-articles')) {
    console.log('Related articles section already exists, skipping');
    return;
  }

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

      // Find articles and their cover images
      let articleItems = [];

      // Try to find articles with their images
      const articles = doc.querySelectorAll('article');

      if (articles.length > 0) {
        console.log(`Found ${articles.length} articles using 'article' selector`);

        articles.forEach(article => {
          const titleEl = article.querySelector('h1, h2') || article.querySelector('.post-title');
          if (!titleEl) return;

          const title = titleEl.textContent.trim();

          // Find the article URL
          let url = '';
          const links = article.querySelectorAll('a');
          for (const link of links) {
            if (link.href && link.href.includes('.html') &&
                !link.href.includes('/category/') &&
                !link.href.includes('/tag/')) {
              url = link.href;
              break;
            }
          }

          if (!url) return;

          // Skip the current article
          if (url.includes(currentPath)) return;

          // Find image - check for cover image or any image
          let image = null;
          const coverImg = article.querySelector('.post-cover img, .cover img');
          if (coverImg && coverImg.src) {
            image = coverImg.src;
          } else {
            const anyImg = article.querySelector('img');
            if (anyImg && anyImg.src) {
              image = anyImg.src;
            }
          }

          articleItems.push({
            title: title,
            url: url,
            image: image
          });
        });
      }

      // If we couldn't find any articles with the above method, try a different approach
      if (articleItems.length === 0) {
        console.log('Trying alternative method to find article listings');

        // Look for post-cards or similar elements
        const cards = doc.querySelectorAll('.post-card, .post-item, .article-card');

        cards.forEach(card => {
          const titleEl = card.querySelector('.post-card-title, .post-title, h2, h3');
          if (!titleEl) return;

          const title = titleEl.textContent.trim();

          let url = '';
          const link = card.querySelector('a[href*=".html"]');
          if (link && link.href) {
            url = link.href;
          }

          if (!url || url.includes(currentPath)) return;

          let image = null;
          const img = card.querySelector('img');
          if (img && img.src) {
            image = img.src;
          }

          articleItems.push({
            title: title,
            url: url,
            image: image
          });
        });
      }

      console.log(`Found ${articleItems.length} related articles`);

      // Randomize and limit
      articleItems = articleItems
        .sort(() => 0.5 - Math.random())
        .slice(0, 15);

      if (articleItems.length === 0) {
        console.log('No related articles after filtering');
        relatedSection.remove();
        return;
      }

      // Create article cards
      articleItems.forEach(item => {
        console.log(`Creating card for article: ${item.title}, image: ${item.image ? 'yes' : 'no'}`);

        const cardEl = document.createElement('div');
        cardEl.className = 'related-article-card';

        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'related-article-link';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'related-article-image';

        if (item.image) {
          const imgEl = document.createElement('img');
          imgEl.src = item.image;
          imgEl.alt = item.title;
          imageDiv.appendChild(imgEl);
        } else {
          const noImageDiv = document.createElement('div');
          noImageDiv.className = 'related-article-no-image';
          noImageDiv.innerHTML = '<span class="icon icon-image"></span>';
          imageDiv.appendChild(noImageDiv);
        }

        const titleEl = document.createElement('h4');
        titleEl.className = 'related-article-title';
        titleEl.textContent = item.title;

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
