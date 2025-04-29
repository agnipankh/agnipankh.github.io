document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on an article page
  const articleContent = document.querySelector('.post-content');
  if (!articleContent) return;

  // Function to get the category from the URL
  function getCurrentCategory() {
    const path = window.location.pathname;
    const categoryMatch = path.match(/\/category\/([^\/]+)\.html/);
    if (categoryMatch) return categoryMatch[1];

    // If the URL doesn't contain the category, look for it in the post info
    const postInfo = document.querySelector('.post-info .post-count');
    return postInfo ? postInfo.textContent.trim().toLowerCase() : null;
  }

  // Get images from the article to determine the current article
  function getCurrentArticleImages() {
    const images = Array.from(articleContent.querySelectorAll('img')).map(img => img.src);
    return images;
  }

  // Function to create related articles section
  async function createRelatedArticles() {
    const category = getCurrentCategory();
    if (!category) return;

    const currentArticleImages = getCurrentArticleImages();
    const currentPath = window.location.pathname;

    try {
      // Request the category page to get all articles
      const response = await fetch(`/category/${category}.html`);
      if (!response.ok) return;

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Get all article cards from the category page
      const articleCards = Array.from(doc.querySelectorAll('.post-card, .article-card'));
      if (articleCards.length === 0) return;

      // Filter out the current article and shuffle the array
      const filteredCards = articleCards
        .filter(card => {
          const link = card.querySelector('a').href;
          // Filter out the current article by path
          if (link.includes(currentPath)) return false;
          return true;
        })
        .sort(() => 0.5 - Math.random()); // Shuffle

      // Take only the first 15 items
      const selectedCards = filteredCards.slice(0, 15);
      if (selectedCards.length === 0) return;

      // Create related articles section
      const relatedSection = document.createElement('section');
      relatedSection.className = 'related-articles';

      // Create title
      const title = document.createElement('h3');
      title.className = 'related-articles-title';
      title.textContent = `More from ${category.charAt(0).toUpperCase() + category.slice(1)}`;
      relatedSection.appendChild(title);

      // Create grid
      const grid = document.createElement('div');
      grid.className = 'related-articles-grid';

      // Create cards
      selectedCards.forEach(card => {
        const articleLink = card.querySelector('a').href;
        const articleTitle = card.querySelector('.post-card-title, .article-title').textContent.trim();
        let articleImage = card.querySelector('img');
        articleImage = articleImage ? articleImage.src : null;

        const relatedCard = document.createElement('div');
        relatedCard.className = 'related-article-card';

        const link = document.createElement('a');
        link.href = articleLink;
        link.className = 'related-article-link';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'related-article-image';

        if (articleImage) {
          const img = document.createElement('img');
          img.src = articleImage;
          img.alt = articleTitle;
          imageDiv.appendChild(img);
        } else {
          const noImageDiv = document.createElement('div');
          noImageDiv.className = 'related-article-no-image';

          const icon = document.createElement('span');
          icon.className = 'icon icon-image';
          noImageDiv.appendChild(icon);

          imageDiv.appendChild(noImageDiv);
        }

        const titleElement = document.createElement('h4');
        titleElement.className = 'related-article-title';
        titleElement.textContent = articleTitle;

        link.appendChild(imageDiv);
        link.appendChild(titleElement);
        relatedCard.appendChild(link);
        grid.appendChild(relatedCard);
      });

      relatedSection.appendChild(grid);

      // Insert the related articles section before the footer
      const postFooter = document.querySelector('.post-footer');
      if (postFooter) {
        postFooter.parentNode.insertBefore(relatedSection, postFooter.nextSibling);
      } else {
        articleContent.parentNode.appendChild(relatedSection);
      }
    } catch (error) {
      console.error('Error creating related articles:', error);
    }
  }

  // Call the function
  createRelatedArticles();
});
