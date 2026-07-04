import PhotoSwipeLightbox from "./assets/photoswipe/photoswipe-lightbox.esm.js";

const lightbox = new PhotoSwipeLightbox({
    // Every product grid becomes a gallery
    gallery: ".product-grid",

    // Every clickable product image inside the gallery
    children: ".product-image",

    // Load PhotoSwipe when an image is opened
    pswpModule: () =>
        import("./assets/photoswipe/photoswipe.esm.js")
});

// Initialize the lightbox
lightbox.init();