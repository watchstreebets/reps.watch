document.addEventListener('DOMContentLoaded', () => {
    // Image data with captions
    const images = [
        { src: '/assets/lume_comparison/lume1_lights_on.jpg', caption: 'Various lumed watches (a few gens as a baseline)' },
        { src: '/assets/lume_comparison/lume2_1min_sun.jpg', caption: 'After a minute of full sun exposure' },
        { src: '/assets/lume_comparison/lume2_5m.jpg', caption: '~3 minutes after sun exposure' },
        { src: '/assets/lume_comparison/lume3_10m.jpg', caption: '10 minutes' },
        { src: '/assets/lume_comparison/lume4_25m.jpg', caption: '20 minutes' },
        { src: '/assets/lume_comparison/lume5_40m.jpg', caption: '40 minutes, by now the Ball tritium lume is clearly dominating' },
        { src: '/assets/lume_comparison/lume6_1hr.jpg', caption: '60 minutes' },
        { src: '/assets/lume_comparison/lume7_90m.jpg', caption: '90 minutes' },
        { src: '/assets/lume_comparison/lume8_2hrs.jpg', caption: 'After ~2 hours my eyes could just barely make out some remaining lume that the camera could not' },
    ];

    if (images.length === 0) {
        document.getElementById('slideshow-images').innerHTML = 
            '<p class="no-images">No images found. Please add images to the array in <code>/js/lume-comparison.js</code></p>';
        return;
    }

    initializeSlideshow(images);

    function initializeSlideshow(imageData) {
        const container = document.getElementById('slideshow-images');
        let currentIndex = 0;

        // Create thumbnail grid
        imageData.forEach((img, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'slideshow-item';
            wrapper.innerHTML = `
                <img src="${img.src}" alt="${img.caption}" class="slideshow-thumbnail" data-index="${index}">
                <p class="slideshow-caption">${img.caption}</p>
            `;
            container.appendChild(wrapper);
        });

        // Get modal elements
        const overlay = document.getElementById('image-lightbox-overlay');
        const fullImg = document.getElementById('image-lightbox-img');
        const caption = document.getElementById('image-lightbox-caption');
        const closeBtn = document.getElementById('image-lightbox-close');
        const prevBtn = document.getElementById('image-lightbox-prev');
        const nextBtn = document.getElementById('image-lightbox-next');

        // Function to show image in modal
        function showImage(index) {
            currentIndex = index;
            fullImg.src = imageData[index].src;
            fullImg.alt = imageData[index].caption;
            caption.textContent = imageData[index].caption;
            overlay.classList.add('visible');

            // Update button visibility
            prevBtn.style.display = index > 0 ? 'block' : 'none';
            nextBtn.style.display = index < imageData.length - 1 ? 'block' : 'none';
        }

        // Click on thumbnail to open modal
        container.addEventListener('click', (e) => {
            const thumbnail = e.target.closest('.slideshow-thumbnail');
            if (thumbnail) {
                const index = parseInt(thumbnail.dataset.index);
                showImage(index);
            }
        });

        // Previous button
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentIndex > 0) {
                showImage(currentIndex - 1);
            }
        });

        // Next button
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentIndex < imageData.length - 1) {
                showImage(currentIndex + 1);
            }
        });

        // Close button
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('visible');
        });

        // Click outside image to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('visible');
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!overlay.classList.contains('visible')) return;

            if (e.key === 'Escape') {
                overlay.classList.remove('visible');
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                showImage(currentIndex - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < imageData.length - 1) {
                showImage(currentIndex + 1);
            }
        });
    }
});
