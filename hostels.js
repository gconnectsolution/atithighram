// ====================== hostels.js (FULL UPDATED) ======================
// Mock data for hostels
const mockHostels = [
    {
        id: "1",
        name: "Fortune Coliving",
        location: "Mahadevapura",
        distance: "3.8 from Brookfield",
        price: 'NA',
        originalPrice: 'NA',
        rating: 4.5,
        reviews: 124,
        type: "Colive",
        image:  ['./fortune1.webp','./fortune2.webp','./fortune3.webp','./fortune4.webp','./fortune5.webp','./fortune6.webp','./fortune7.webp','./fortune8.webp',],
        amenities: ["WiFi", "AC", "Meals", "Laundry", "Parking"],
        occupancy: "Single, Double & Triple sharing",
        availability: "Available",
        verified: true,
        featured: false,
        gender: 'Male',
        phoneNumber: '9538992777',
        address : 'Site No.7, XMQX+46 Krishna garden, Bagmane Tech parkback gate, Goshala Rd, Garudachar Palya, Mahadevapura, Bengaluru, Karnataka 560048'
    },
    {
        id: "2",
        name: "Bliss comfort Coliving PG",
        location: "Marathahalli",
        distance: "3.0 km from 7,lake road",
        price: 8500,
        rating: 4.2,
        reviews: 87,
        type: "Colive",
        image: ['./bliss1.webp','./bliss2.webp','./bliss3.webp','./bliss4.webp','./bliss5.webp','./bliss6.webp','./bliss7.webp','./bliss8.webp',],
        amenities: ["WiFi", "Meals", "Security", "Housekeeping"],
        occupancy: "Double & Triple sharing",
        availability: "2 beds left",
        verified: true,
        featured: false,
        gender: 'Male',
        phoneNumber: '7829930666',
        address: '2, 87/1, Maheshwari Enclave, Marathahalli Outer Ring Rd, behind Karthik nagar, LRDE Layout, Doddanekundi, Doddanekkundi, Bengaluru, Karnataka 560037'
    },
    {
        id: "3",
        name: "Delight co living pg",
        location: "WhiteField",
        distance: "1.0 km from ITPB",
        price: 14500,
        originalPrice: 16000,
        rating: 4.7,
        reviews: 156,
        type: "Colive",
        image: ['./delight1.webp','./delight2.webp','./delight3.webp','./delight4.webp','./delight5.webp','./delight6.webp','./delight7.webp','./delight8.webp',],
        amenities: ["WiFi", "AC", "Gym", "Parking", "Power Backup"],
        occupancy: "Single & Double sharing",
        availability: "Available",
        verified: true,
        featured: true,
        gender: 'Male',
        phoneNumber: '8884440691',
        address : 'Site no.10, ITPL back gate, Pattandur Agrahara, Whitefield, Bengaluru, Karnataka 560066'
    },
    {
        id: "4",
        name: "Shri Sainatha luxury pg for gents",
        location: "Doddakannelli",
        distance: "1.5 km from Doddakannelli lake",
        price: 7000,
        rating: 4.0,
        reviews: 43,
        type: "Gents",
        image: ['./shri1.webp'],
        amenities: ["WiFi", "Meals", "Laundry"],
        occupancy: "Triple & Quad sharing",
        availability: "Available",
        verified: false,
        featured: false,
        gender: 'Male',
        phoneNumber: 'NA',
        address: 'embassy tech village back gate, &, 1st Cross St, near RMZ ecoworld, Janatha Colony, Doddakannelli, Bengaluru, Karnataka 560103'
    },
    {
        id: "5",
        name: "RK Premium Co-living PG",
        location: "Nagavara",
        distance: "2.0 km from Dmart RT nagar",
        price: 18000,
        rating: 4.6,
        reviews: 92,
        type: "Colive",
        image: ['./rk1.webp','./rk2.webp','./rk3.webp','./rk4.webp',],
        amenities: ["WiFi", "AC", "Gym", "Parking", "Refrigerator", "CCTV"],
        occupancy: "Single sharing only",
        availability: "Available",
        verified: true,
        featured: true,
        gender: 'Male',
        phoneNumber: '7353505777',
        address: '762&763, near Sri Chaitanya school, Vyalikaval HBCS Layout, Nagavara, Bengaluru, Karnataka 560045'
    },
];

// ====================== Global state ======================

let filteredHostels = [...mockHostels];
let currentFilters = {
    location: '',
    type: '',
    minPrice: 5000,
    maxPrice: 25000,
    amenities: []
};
let currentSort = 'featured';
let currentViewMode = 'grid';

// We keep slideshow intervals map so we can clear them if needed
const slideshowIntervals = {};

// ====================== Helpers (safe DOM access) ======================
// safeGet(id) returns element or null
function safeGet(id) {
    return document.getElementById(id) || null;
}

// safeValue(id, fallback) returns element.value if element exists else fallback
function safeValue(id, fallback = '') {
    const el = safeGet(id);
    if (!el) return fallback;
    // for selects/inputs return value; for others return textContent
    return (el.value !== undefined) ? el.value : el.textContent || fallback;
}

// safeSetValue(id, value) sets value if element exists
function safeSetValue(id, value) {
    const el = safeGet(id);
    if (!el) return;
    if (el.value !== undefined) el.value = value;
    else el.textContent = value;
}

// parseIntSafe(value, fallback)
function parseIntSafe(value, fallback = 0) {
    const n = parseInt(value);
    return Number.isNaN(n) ? fallback : n;
}

// get filter values; prefer mobile filters (since you removed desktop container)
function getFilterValues() {
    // If mobile filters exist use them; otherwise fallback to desktop ids if present
    const location = safeValue('mobileLocationFilter', safeValue('locationFilter', '')).trim();
    const type = safeValue('mobileTypeFilter', safeValue('typeFilter', '')).trim();
    // Price sliders: check mobile first, then desktop
    const minPriceStr = safeValue('mobileMinPrice', safeValue('minPrice', currentFilters.minPrice));
    const maxPriceStr = safeValue('mobileMaxPrice', safeValue('maxPrice', currentFilters.maxPrice));
    const minPrice = parseIntSafe(minPriceStr, currentFilters.minPrice);
    const maxPrice = parseIntSafe(maxPriceStr, currentFilters.maxPrice);

    // Amenities checkboxes - query all checkboxes in DOM (works both desktop/mobile)
    const selectedAmenities = [];
    const amenityCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    amenityCheckboxes.forEach(cb => {
        if (cb.value) selectedAmenities.push(cb.value);
    });

    return {
        location,
        type,
        minPrice,
        maxPrice,
        amenities: selectedAmenities
    };

}

// Update currentFilters from DOM
function updateCurrentFiltersFromDOM() {
    currentFilters = getFilterValues();
}

// ====================== Initialization ======================
document.addEventListener('DOMContentLoaded', function() {
    // initial render
    applyCurrentFilters(); // sets filteredHostels
    renderHostels();
    updateResultsCount();

    // setup listeners
    setupEventListeners();

    // initialize forum if present
    if (typeof initializeForum === 'function') {
        initializeForum();
    }
});

// ====================== Event listeners ======================
function setupEventListeners() {
    // price inputs (mobile prioritized)
    const mobileMinPriceEl = safeGet('mobileMinPrice');
    const mobileMaxPriceEl = safeGet('mobileMaxPrice');
    const desktopMinPriceEl = safeGet('minPrice');
    const desktopMaxPriceEl = safeGet('maxPrice');

    if (mobileMinPriceEl) mobileMinPriceEl.addEventListener('input', updateMobilePriceRange);
    if (mobileMaxPriceEl) mobileMaxPriceEl.addEventListener('input', updateMobilePriceRange);
    if (desktopMinPriceEl) desktopMinPriceEl.addEventListener('input', updatePriceRange);
    if (desktopMaxPriceEl) desktopMaxPriceEl.addEventListener('input', updatePriceRange);

    // search
    const searchInput = safeGet('searchInput');
    if (searchInput) searchInput.addEventListener('input', handleSearch);

    // sort select
    const sortBy = safeGet('sortBy');
    if (sortBy) sortBy.addEventListener('change', sortListings);

    // view mode buttons (if present)
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => setViewMode(btn.dataset.mode));
    });

    // amenities checkboxes
    // listen globally for change on checkboxes (if they exist)
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // toggles for mobile filter modal
    const mobileFiltersToggle = document.querySelectorAll('[data-toggle="mobile-filters"]');
    mobileFiltersToggle.forEach(btn => {
        btn.addEventListener('click', toggleMobileFilters);
    });

    // close mobile filters clicking outside content (guarded)
    document.addEventListener('click', function(e) {
        // if there is a mobileFiltersModal
        const mobileModal = safeGet('mobileFiltersModal');
        if (!mobileModal) return;
        // if clicked on the modal backdrop (assuming .mobile-filters-modal is backdrop)
        if (e.target.closest && e.target.closest('.mobile-filters-modal') && !e.target.closest('.modal-content')) {
            toggleMobileFilters();
        }
    });

    // global click to close generic modals by clicking backdrop (if you have .modal)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('modal')) {
            // if modal id equals specific ones, call their closers if available
            const id = e.target.id || '';
            if (id === 'questionModal' && typeof closeQuestionModal === 'function') closeQuestionModal();
            if (id === 'mobileForumFilters' && typeof toggleForumFilters === 'function') toggleForumFilters();
        }
    });
}

// ====================== Search ======================
function handleSearch() {
    const searchEl = safeGet('searchInput');
    const searchTerm = (searchEl && searchEl.value) ? searchEl.value.toLowerCase() : '';
    if (!searchTerm) {
        // reset to all hostels and then reapply filters for price/location/type
        filteredHostels = [...mockHostels];
    } else {
        filteredHostels = mockHostels.filter(hostel =>
            hostel.name.toLowerCase().includes(searchTerm) ||
            hostel.location.toLowerCase().includes(searchTerm) ||
            hostel.type.toLowerCase().includes(searchTerm)
        );
    }
    applyCurrentFilters(); // will use currentFilters + search term
    renderHostels();
    updateResultsCount();
}

function performSearch() {
    handleSearch();
}

// ====================== Filter functions ======================
function applyFilters() {
    // This function is triggered by UI changes (check/uncheck, price sliders etc)
    updateCurrentFiltersFromDOM();

    // After updating currentFilters, apply them
    applyCurrentFilters();
    renderHostels();
    updateResultsCount();
    updateActiveFilters();
}

function applyCurrentFilters() {
    // Use filteredHostels (maybe set by search) as base
    let base = [...mockHostels];

    // If user has typed search, prefer that subset
    const searchTerm = safeValue('searchInput', '').toLowerCase();
    if (searchTerm) {
        base = base.filter(hostel =>
            hostel.name.toLowerCase().includes(searchTerm) ||
            hostel.location.toLowerCase().includes(searchTerm) ||
            hostel.type.toLowerCase().includes(searchTerm)
        );
    }

    // Now apply the currentFilters to base
    filteredHostels = base.filter(hostel => {
        const minP = currentFilters.minPrice ?? 0;
        const maxP = currentFilters.maxPrice ?? Infinity;

        // Price
        if (hostel.price < minP || hostel.price > maxP) return false;

        // Location - case-insensitive "includes"
        if (currentFilters.location) {
            if (!hostel.location.toLowerCase().includes(currentFilters.location.toLowerCase())) return false;
        }

        // Type - if user picked from dropdown, match exact
        // Type - if user picked from dropdown, match exact ignoring case & trim
        if (currentFilters.type && currentFilters.type !== "All") {
            if (hostel.type.trim().toLowerCase() !== currentFilters.type.trim().toLowerCase()) {
                return false;
            }
        }
        console.log("Hostel type:", hostel.location, " | Selected type:", currentFilters.location);


        // Amenities - must include all chosen ones
        if (currentFilters.amenities && currentFilters.amenities.length > 0) {
            const hasAllAmenities = currentFilters.amenities.every(am => hostel.amenities.includes(am));
            if (!hasAllAmenities) return false;
        }

        return true;
    });

    // Apply sorting on the filteredHostels
    sortListings();
}


function syncMobileFilters() {
    // Mirror currentFilters into mobile inputs if present
    const mobileLocation = safeGet('mobileLocationFilter');
    const mobileType = safeGet('mobileTypeFilter');
    const mobileMin = safeGet('mobileMinPrice');
    const mobileMax = safeGet('mobileMaxPrice');

    if (mobileLocation) mobileLocation.value = currentFilters.location || '';
    if (mobileType) mobileType.value = currentFilters.type || '';
    if (mobileMin) mobileMin.value = currentFilters.minPrice ?? '';
    if (mobileMax) mobileMax.value = currentFilters.maxPrice ?? '';

    // update the mobile UI price labels if present
    updateMobilePriceRange();
}

//slider
var priceSlider = document.getElementById('price-slider');

noUiSlider.create(priceSlider, {
    start: [10000, 40000],  // default min & max
    connect: true,
    range: {
        'min': 3000,
        'max': 50000
    },
    step: 1000,  // increment steps
    tooltips: true, // show tooltips on handles
    format: {
        to: value => Math.round(value),
        from: value => Number(value)
    }
});

var minPrice = document.getElementById('min-price');
var maxPrice = document.getElementById('max-price');

// Update values when slider moves
priceSlider.noUiSlider.on('update', function(values, handle) {
    if (handle === 0) {
        minPrice.innerHTML = "₹" + values[0];
    } else {
        maxPrice.innerHTML = "₹" + values[1];
    }
});

function clearAllFilters() {
    // Clear mobile filters (we assume you're using mobile filter container)
    const mobileLocation = safeGet('mobileLocationFilter');
    const mobileType = safeGet('mobileTypeFilter');
    const mobileMin = safeGet('mobileMinPrice');
    const mobileMax = safeGet('mobileMaxPrice');

    if (mobileLocation) mobileLocation.value = '';
    if (mobileType) mobileType.value = '';
    if (mobileMin) mobileMin.value = 5000;
    if (mobileMax) mobileMax.value = 25000;

    // uncheck all amenity checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

    // reset currentFilters
    currentFilters = {
        location: '',
        type: '',
        minPrice: 5000,
        maxPrice: 25000,
        amenities: []
    };

    // apply everything
    applyCurrentFilters();
    renderHostels();
    updateResultsCount();
    updateActiveFilters();
}

function updateActiveFilters() {
    const activeFiltersDiv = safeGet('activeFilters');
    const filterTagsDiv = safeGet('filterTags');

    if (!activeFiltersDiv || !filterTagsDiv) return;

    const hasActiveFilters = !!(currentFilters.location || currentFilters.type || (currentFilters.amenities && currentFilters.amenities.length > 0));

    if (!hasActiveFilters) {
        activeFiltersDiv.style.display = 'none';
        filterTagsDiv.innerHTML = '';
        return;
    }

    activeFiltersDiv.style.display = 'block';
    const tags = [];

    if (currentFilters.location) {
        tags.push(`<span class="filter-tag">${currentFilters.location} <i class="fas fa-times remove-tag" onclick="removeFilter('location')"></i></span>`);
    }
    if (currentFilters.type) {
        tags.push(`<span class="filter-tag">${currentFilters.type} <i class="fas fa-times remove-tag" onclick="removeFilter('type')"></i></span>`);
    }
    if (currentFilters.amenities && currentFilters.amenities.length) {
        currentFilters.amenities.forEach(a => {
            tags.push(`<span class="filter-tag">${a} <i class="fas fa-times remove-tag" onclick="removeFilter('amenity','${a}')"></i></span>`);
        });
    }

    filterTagsDiv.innerHTML = tags.join('');
}

function removeFilter(type, value) {
    if (type === 'location') {
        currentFilters.location = '';
        safeSetValue('mobileLocationFilter', '');
        safeSetValue('locationFilter', '');
    } else if (type === 'type') {
        currentFilters.type = '';
        safeSetValue('mobileTypeFilter', '');
        safeSetValue('typeFilter', '');
    } else if (type === 'amenity') {
        currentFilters.amenities = (currentFilters.amenities || []).filter(a => a !== value);
        // uncheck related checkbox(es)
        document.querySelectorAll(`input[type="checkbox"][value="${value}"]`).forEach(cb => cb.checked = false);
    }

    applyCurrentFilters();
    renderHostels();
    updateResultsCount();
    updateActiveFilters();
}

// ====================== Price range functions ======================
function updatePriceRange() {
    // Desktop price range support (if desktop sliders are present)
    const minEl = safeGet('minPrice');
    const maxEl = safeGet('maxPrice');
    const minValueEl = safeGet('minPriceValue');
    const maxValueEl = safeGet('maxPriceValue');

    if (!minEl || !maxEl || !minValueEl || !maxValueEl) return;

    const minPrice = parseIntSafe(minEl.value, 5000);
    const maxPrice = parseIntSafe(maxEl.value, 25000);

    minValueEl.textContent = `₹${minPrice.toLocaleString()}`;
    maxValueEl.textContent = `₹${maxPrice.toLocaleString()}`;

    if (minPrice > maxPrice) {
        minEl.value = maxPrice;
    }

    // update current filters and apply
    currentFilters.minPrice = minPrice;
    currentFilters.maxPrice = maxPrice;

    // debounce-like behaviour: use small timeout before apply
    clearTimeout(updatePriceRange._timeout);
    updatePriceRange._timeout = setTimeout(applyFilters, 300);
}

function updateMobilePrice() {
    const price = document.getElementById("mobilePrice").value;
    document.getElementById("mobilePriceValue").innerText = `₹${Number(price).toLocaleString()}`;
}


// ====================== Sorting functions ======================
function sortListings() {
    // determine desired sort from DOM (if select exists)
    const sortByEl = safeGet('sortBy');
    if (sortByEl && sortByEl.value) {
        currentSort = sortByEl.value;
    }

    switch (currentSort) {
        case 'price-low':
            filteredHostels.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredHostels.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredHostels.sort((a, b) => b.rating - a.rating);
            break;
        case 'featured':
        default:
            filteredHostels.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return b.rating - a.rating;
            });
            break;
    }

    // re-render
    renderHostels();
}

// ====================== View mode functions ======================
function setViewMode(mode) {
    currentViewMode = mode;
    const gridContainer = safeGet('hostelsGrid') || safeGet('hostelsList') || document.querySelector('.hostels-container');

    if (!gridContainer) return;

    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) btn.classList.add('active');
    });

    if (mode === 'list') gridContainer.classList.add('list-view');
    else gridContainer.classList.remove('list-view');
}

// ====================== Mobile UI helpers ======================
function toggleMobileMenu() {
    console.log('Mobile menu toggled');
}

function toggleMobileFilters() {
    const modal = document.getElementById('mobileFiltersModal');
    if (modal) {
        modal.classList.toggle('active');
    }
}


// ====================== Render functions ======================
function renderHostels() {
    const grid = safeGet('hostelsGrid') || safeGet('hostelsList') || document.querySelector('.hostels-container');
    if (!grid) return;

    if (!filteredHostels || filteredHostels.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>No PG's found</h3>
                <p>Try adjusting your filters to see more results</p>
            </div>
        `;
        return;
    }

    const hostelsHTML = filteredHostels.map(hostel => createHostelCard(hostel)).join('');
    grid.innerHTML = hostelsHTML;

    // initialize any inline listeners if needed (e.g., slideshow per card)
    filteredHostels.forEach(hostel => {
        try { // start slideshow if images exist
            startSlideshowForCard(hostel.id);
        } catch (e) {
            // fail gracefully
        }
    });

    grid.classList.add('fade-in');
    setTimeout(() => grid.classList.remove('fade-in'), 300);
}

function createHostelCard(hostel) {
    const discountPercentage = hostel.originalPrice
        ? Math.round(((hostel.originalPrice - hostel.price) / hostel.originalPrice) * 100)
        : 0;

    const badges = [];
    if (hostel.featured) badges.push('<span class="badge featured">Featured</span>');
    if (hostel.verified) badges.push('<span class="badge verified"><i class="fas fa-shield-alt"></i> Verified</span>');
    if (discountPercentage > 0) badges.push(`<span class="badge discount">${discountPercentage}% OFF</span>`);

    const availabilityClass = hostel.availability === 'Available' ? 'available' : 'limited';

    const amenityIcons = {
        'WiFi': 'fas fa-wifi',
        'AC': 'fas fa-snowflake',
        'Parking': 'fas fa-car',
        'Security': 'fas fa-shield-alt',
        'Gym': 'fas fa-dumbbell',
        'Meals': 'fas fa-utensils'
    };

    const amenitiesHTML = (hostel.amenities || []).slice(0, 4).map(amenity => {
        const icon = amenityIcons[amenity] || 'fas fa-check';
        return `<span class="amenity-badge"><i class="${icon}"></i> ${amenity}</span>`;
    }).join('');

    const moreAmenities = (hostel.amenities && hostel.amenities.length > 4)
        ? `<span class="amenity-badge more-amenities">+${hostel.amenities.length - 4} more</span>`
        : '';

    const originalPriceHTML = hostel.originalPrice ? `<span class="price-original">₹${hostel.originalPrice.toLocaleString()}</span>` : '';

    // ensure images: accept array or single string
    let imageHtml = '';
    if (Array.isArray(hostel.image)) {
        imageHtml = hostel.image.map((img, i) => `<img src="${img}" alt="${hostel.name}" class="hostel-image ${i===0 ? 'active' : ''}" loading="lazy">`).join('');
    } else {
        imageHtml = `<img src="${hostel.image}" alt="${hostel.name}" class="hostel-image active" loading="lazy">`;
    }

    return `
        <div class="hostel-card" data-id="${hostel.id}">
            <div class="hostel-image-container" id="hostel-img-${hostel.id}">
                ${imageHtml}
                <!--<div class="hostel-badges">${badges.join('')}</div>
                <button class="favorite-btn" onclick="toggleFavorite(event, '${hostel.id}')">
                    <i class="far fa-heart"></i>
                </button>
                <div class="availability-badge">
                    <span class="badge ${availabilityClass}">${hostel.availability}</span>
                </div>-->
            </div>

            <div class="hostel-content">
                <div class="hostel-header">
                    <div>
                        <h3 class="hostel-title">${hostel.name}</h3>
                        <div class="hostel-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${hostel.location}</span>
                            <span>•</span>
                            <span>${hostel.distance}</span>
                        </div>
                    </div>
                    <span class="hostel-type">${hostel.type}</span>
                </div>

                <div class="hostel-rating">
                    <div class="rating-stars">
                        <i class="fas fa-star" style="color: #fbbf24;"></i>
                        <span class="rating-value">${hostel.rating}</span>
                    </div>
                    <span class="rating-reviews">(${hostel.reviews} reviews)</span>
                </div>

                <div class="hostel-amenities">${amenitiesHTML}${moreAmenities}</div>

                <div class="hostel-occupancy">
                    <i class="fas fa-users"></i>
                    <span>${hostel.occupancy}</span>
                </div>

                <div class="hostel-footer">
                    <!--<div class="hostel-price">
                        <div class="price-main">
                            <span class="price-current">₹${hostel.price.toLocaleString()}</span>
                            ${originalPriceHTML}
                        </div>
                        <span class="price-period">per month</span>
                    </div>-->

                    <div class="hostel-actions">
                        <button class="btn btn-outline" onclick="event.stopPropagation(); callHostel('${hostel.id}')">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="btn btn-primary" onclick="event.stopPropagation(); viewHostelDetails('${hostel.id}')">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ====================== Results count ======================
function updateResultsCount() {
    const count = filteredHostels.length;
    const resultsCountEl = safeGet('resultsCount');
    if (resultsCountEl) resultsCountEl.textContent = `${count} PG's Found`;
}

// ====================== Hostel interactions ======================

let currentIndex = 0;

function changeImage(step) {
    const images = document.querySelectorAll("#popupImages .popup-image");
    if (images.length === 0) return;

    images[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + step + images.length) % images.length;
    images[currentIndex].classList.add("active");
    console.log('image changed')
}


function viewHostelDetails(id) {
    const hostel = mockHostels.find(h => h.id === id);
    if (!hostel) return;

    // populate popup elements if present, otherwise create a quick modal
    const popup = safeGet('hostelPopup');
    const popupTitle = safeGet('popupTitle');
    const popupBody = safeGet('popupBody');

    if (popup && popupTitle && popupBody) {
        popupTitle.textContent = hostel.name;
        popupBody.innerHTML = `
            <div>
            <br/>
            <p><strong>Location:</strong> ${hostel.location}</p>
            <p><strong>Distance:</strong> ${hostel.distance}</p>
            <!--<p><strong>Price:</strong> ₹${hostel.price.toLocaleString()} 
                ${hostel.originalPrice ? `<span style="text-decoration: line-through; color: #888;">₹${hostel.originalPrice.toLocaleString()}</span>` : ""}
            </p>-->
            <p><strong>Rating:</strong> ⭐ ${hostel.rating} (${hostel.reviews} reviews)</p>
            <p><strong>Amenities:</strong> ${hostel.amenities.join(", ")}</p>
            <p><strong>Occupancy:</strong> ${hostel.occupancy}</p>
            <p><strong>Availability:</strong> ${hostel.availability}</p>
            <p><strong>Call us now:</strong> ${hostel.phoneNumber}</p>
            <br/>
            </div>
            
            <div class="popup-image-container">
                <div class="popup-images" id="popupImages">
                    ${Array.isArray(hostel.image) 
                        ? hostel.image.map((img, i) => `<img src="${img}" class="popup-image ${i===0?'active':''}" alt="${hostel.name}">`).join("") 
                        : `<img src="${hostel.image}" class="popup-image active" alt="${hostel.name}">`
                    }
                </div>
            </div>
        `;

        // show popup
        popup.style.display = "flex";
        startSlideshow("popupImages");
        return;
    }

    // fallback: create a quick modal element
    const quick = document.createElement('div');
    quick.className = 'quick-modal';
    quick.innerHTML = `
        <div class="quick-modal-content">
            <button class="close" onclick="this.closest('.quick-modal').remove()">×</button>
            <h2>${hostel.name}</h2>
            <p><strong>Location:</strong> ${hostel.location}</p>
            <p><strong>Price:</strong> ₹${hostel.price.toLocaleString()}</p>
            <p><strong>Amenities:</strong> ${hostel.amenities.join(", ")}</p>
        </div>
    `;
    document.body.appendChild(quick);
}



function closePopup() {
    const popup = safeGet('hostelPopup');
    if (popup) popup.style.display = 'none';
}

function startSlideshow(containerId, intervalTime = 3000) {
    const container = safeGet(containerId);
    if (!container) return;

    const images = container.querySelectorAll("img");
    if (!images || images.length === 0) return;

    // If only one image → just show it, no slideshow
    if (images.length === 1) {
        images[0].style.display = "block";
        return;
    }

    let index = 0;

    // clear any previous interval
    if (slideshowIntervals[containerId]) {
        clearInterval(slideshowIntervals[containerId]);
    }

    // show first image
    images.forEach((img, i) => {
        img.style.display = i === 0 ? "block" : "none";
    });

    // run slideshow
    slideshowIntervals[containerId] = setInterval(() => {
        images[index].style.display = "none";    // hide current
        index = (index + 1) % images.length;     // move to next
        images[index].style.display = "block";   // show next
    }, intervalTime);
}

function startSlideshowForCard(hostelId, intervalTime = 2000) {
    const containerId = `hostel-img-${hostelId}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    const images = container.querySelectorAll("img");
    if (!images || images.length === 0) return;

    // Wrap images inside a slider track
    let track = container.querySelector(".slider-track");
    if (!track) {
        track = document.createElement("div");
        track.classList.add("slider-track");
        track.style.display = "flex";
        track.style.transition = "transform 0.5s ease-in-out";
        track.style.width = `${images.length * 100}%`;
        track.style.height = `${images.length * 100}%`;

        images.forEach(img => {
            img.style.width = `${100 / images.length}%`;
            img.style.height = `${100 / images.length}%`;
            img.style.flexShrink = "0";
            track.appendChild(img);
        });
        container.appendChild(track);
    }

    let index = 0;

    if (slideshowIntervals[containerId]) {
        clearInterval(slideshowIntervals[containerId]);
    }

    slideshowIntervals[containerId] = setInterval(() => {
        index = (index + 1) % images.length;
        track.style.transform = `translateX(-${index * (100 / images.length)}%)`;
    }, intervalTime);
}




function toggleFavorite(event, id) {
    // event passed from onclick; stopPropagation is done inline by caller when needed
    if (event) event.stopPropagation();
    const favoriteBtn = (event && event.currentTarget) ? event.currentTarget : (event && event.target) ? event.target.closest('.favorite-btn') : null;

    // more robust: locate the icon inside the DOM by house id
    let icon = null;
    if (!favoriteBtn) {
        const card = document.querySelector(`.hostel-card[data-id="${id}"]`);
        if (card) icon = card.querySelector('.favorite-btn i');
    } else {
        icon = favoriteBtn.querySelector ? favoriteBtn.querySelector('i') : null;
    }

    if (!icon) {
        // fallback: find any heart in the card
        const cardIcon = document.querySelector(`.hostel-card[data-id="${id}"] .favorite-btn i`);
        if (cardIcon) icon = cardIcon;
    }

    if (!icon) return;

    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        icon.style.color = '#d4183d';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        icon.style.color = '';
    }
}

function callHostel(id) {
    // find hostel by id
    const hostel = mockHostels.find(h => h.id === id);

    if (!hostel || !hostel.phoneNumber) {
        alert("Phone number not available for this hostel.");
        return;
    }

    const phoneNumber = hostel.phoneNumber;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
        // 📱 open dialer
        window.location.href = `tel:${phoneNumber}`;
    } else {
        // 💻 just show the number
        alert(`Call this number: ${phoneNumber}`);
    }
}



// ====================== Utility functions ======================
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN').format(price);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ====================== Initialize price ranges on load ======================
window.addEventListener('load', function() {
    // Initialize desktop price labels if present
    if (safeGet('minPrice') && safeGet('maxPrice')) updatePriceRange();
    // Initialize mobile price labels if present
    if (safeGet('mobileMinPrice') && safeGet('mobileMaxPrice')) updateMobilePriceRange();

    // render hostels once more (in case DOM updated)
    applyCurrentFilters();
    renderHostels();
    updateResultsCount();
});

function showForumNotification(type) {
    const notif = document.getElementById("forumNotification");
    const notifText = document.getElementById("forumNotificationText");

    if (type === "question") {
        notifText.textContent = "New question posted!";
    } else if (type === "answer") {
        notifText.textContent = "New answer added!";
    }

    notif.style.display = "flex";

    // Auto-hide after 4 seconds
    setTimeout(() => {
        notif.style.display = "none";
    }, 4000);
}
function showToast(type, name, questionTitle, content = "") {
    const toast = document.getElementById("toast");

    let message = "";
    if (type === "answer") {
        message = `<span class="toast-name">${name} replied to the question</span>: ${questionTitle}<br><span class="toast-question">${content}</span>`;
    } else if (type === "question") {
        message = `<span class="toast-name">${name} asked a question</span>: ${questionTitle}<br><span class="toast-question">${content}</span>`;
    }

    toast.innerHTML = message;
    toast.className = "toast show";

    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 5000);
}




// ====================== Community Forum (kept mostly intact but DOM-guarded) ======================
let forumPosts = [];
let forumAnswers ={};
let filteredForumPosts = [...forumPosts];
// ================== Preloaded Data ==================
forumPosts = [
    {
        id: "q1",
        title: "How is the food quality in Modern PG Stay?",
        content: "I’m considering staying here but I’m worried about the food options. Can anyone share their experience?",
        author: { name: "Rahul", avatar: "", joinDate: "2024-01-01" },
        location: "Koramangala",
        pgName: "Modern PG Stay",
        timestamp: "2 days ago",
        upvotes: 5,
        answers: 2,
        tags: ["food", "quality", "pg"],
        isAnswered: true,
        featured: false
    },
    {
        id: "q2",
        title: "Is WiFi reliable at Sunshine PG?",
        content: "I work from home so a good internet connection is a must. Can someone confirm?",
        author: { name: "Sneha", avatar: "", joinDate: "2024-02-15" },
        location: "HSR Layout",
        pgName: "Sunshine PG",
        timestamp: "1 day ago",
        upvotes: 8,
        answers: 1,
        tags: ["wifi", "internet", "work"],
        isAnswered: true,
        featured: false
    },
    {
        id: "q3",
        title: "Do they allow guests overnight?",
        content: "Planning to have my parents visit me for a couple of days. Will the PG management allow overnight stays for guests?",
        author: { name: "Arjun", avatar: "", joinDate: "2024-03-02" },
        location: "BTM Layout",
        pgName: "Elite PG",
        timestamp: "4 days ago",
        upvotes: 3,
        answers: 1,
        tags: ["guests", "rules", "stay"],
        isAnswered: true,
        featured: false
    },
    {
        id: "q4",
        title: "How safe is the area around CityNest PG for women?",
        content: "I’ll be returning late from office sometimes. Is the area safe and well-lit at night?",
        author: { name: "Neha", avatar: "", joinDate: "2024-04-10" },
        location: "Indiranagar",
        pgName: "CityNest PG",
        timestamp: "3 days ago",
        upvotes: 12,
        answers: 3,
        tags: ["safety", "women", "area"],
        isAnswered: true,
        featured: false
    },
    {
        id: "q5",
        title: "Is laundry service included in rent?",
        content: "Some PGs charge extra for laundry. Can anyone confirm how it works in CozyStay PG?",
        author: { name: "Mohit", avatar: "", joinDate: "2024-05-18" },
        location: "Marathahalli",
        pgName: "CozyStay PG",
        timestamp: "5 days ago",
        upvotes: 2,
        answers: 2,
        tags: ["laundry", "rent", "service"],
        isAnswered: true,
        featured: false
    },
    {
        id: "q6",
        title: "How is the cleanliness and housekeeping?",
        content: "I have dust allergy, so cleanliness is very important for me. How well do they maintain rooms in DreamHome PG?",
        author: { name: "Shivani", avatar: "", joinDate: "2024-06-20" },
        location: "Whitefield",
        pgName: "DreamHome PG",
        timestamp: "6 days ago",
        upvotes: 6,
        answers: 2,
        tags: ["cleanliness", "rooms", "allergy"],
        isAnswered: true,
        featured: false
    }
];

forumAnswers = {
    "q1": [
        {
            id: "a1",
            content: "Food is decent, mostly North Indian style. They serve both veg and non-veg. Not restaurant quality but manageable.",
            author: { name: "Ankit", avatar: "" },
            timestamp: "1 day ago",
            upvotes: 3,
            isVerified: true,
            helpful: true
        },
        {
            id: "a2",
            content: "I stayed for 6 months. Breakfast is good, but dinner is repetitive. If you’re a foodie, you might get bored.",
            author: { name: "Priya", avatar: "" },
            timestamp: "12 hours ago",
            upvotes: 2,
            isVerified: false,
            helpful: false
        }
    ],
    "q2": [
        {
            id: "a3",
            content: "WiFi is stable most of the time (100 Mbps). During peak evening hours, it slows down a bit but works fine for office calls.",
            author: { name: "Karthik", avatar: "" },
            timestamp: "5 hours ago",
            upvotes: 4,
            isVerified: true,
            helpful: false
        }
    ],
    "q3": [
        {
            id: "a4",
            content: "Most PGs don’t allow overnight guests unless it’s parents. You need to inform the warden in advance.",
            author: { name: "Ramesh", avatar: "" },
            timestamp: "2 days ago",
            upvotes: 1,
            isVerified: false,
            helpful: true
        }
    ],
    "q4": [
        {
            id: "a5",
            content: "Area is pretty safe. There are police patrols at night and plenty of street lights.",
            author: { name: "Pooja", avatar: "" },
            timestamp: "2 days ago",
            upvotes: 5,
            isVerified: true,
            helpful: true
        },
        {
            id: "a6",
            content: "I have been staying here for 1 year. It’s safe, but avoid shortcuts through empty lanes late at night.",
            author: { name: "Deepak", avatar: "" },
            timestamp: "1 day ago",
            upvotes: 4,
            isVerified: false,
            helpful: false
        },
        {
            id: "a7",
            content: "Plenty of cabs and autos available at all times. I feel comfortable commuting even after 11 PM.",
            author: { name: "Sanya", avatar: "" },
            timestamp: "12 hours ago",
            upvotes: 3,
            isVerified: false,
            helpful: true
        }
    ],
    "q5": [
        {
            id: "a8",
            content: "Laundry is included for 2 times a week. Extra washes are chargeable.",
            author: { name: "Nitin", avatar: "" },
            timestamp: "3 days ago",
            upvotes: 2,
            isVerified: false,
            helpful: true
        },
        {
            id: "a9",
            content: "They have a washing machine you can use anytime. No extra cost.",
            author: { name: "Suresh", avatar: "" },
            timestamp: "2 days ago",
            upvotes: 1,
            isVerified: false,
            helpful: false
        }
    ],
    "q6": [
        {
            id: "a10",
            content: "Rooms are cleaned every alternate day, common areas daily. Pretty neat overall.",
            author: { name: "Meena", avatar: "" },
            timestamp: "2 days ago",
            upvotes: 3,
            isVerified: true,
            helpful: true
        },
        {
            id: "a11",
            content: "Some corners get dusty, but if you remind the staff they clean immediately.",
            author: { name: "Vivek", avatar: "" },
            timestamp: "1 day ago",
            upvotes: 2,
            isVerified: false,
            helpful: false
        }
    ]
};

filteredForumPosts = [...forumPosts];


let currentForumFilters = {
    search: '',
    category: '',
    location: ''
};
let currentForumSort = 'recent';
let expandedPost = null;

function initializeForum() {
    renderForumPosts();
    updateForumResultsCount();
}

function filterPosts() {
    const searchEl = safeGet('forumSearch');
    const catEl = safeGet('forumCategory');
    const locEl = safeGet('forumLocation');

    currentForumFilters.search = searchEl ? (searchEl.value || '') : '';
    currentForumFilters.category = catEl ? (catEl.value || '') : '';
    currentForumFilters.location = locEl ? (locEl.value || '') : '';

    applyForumFilters();
    renderForumPosts();
    updateForumResultsCount();
    updateForumFilterInfo();
}

function applyForumFilters() {
    filteredForumPosts = forumPosts.filter(post => {
        if (currentForumFilters.search) {
            const term = currentForumFilters.search.toLowerCase();
            const searchMatch = (post.title && post.title.toLowerCase().includes(term)) ||
                                (post.content && post.content.toLowerCase().includes(term)) ||
                                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)));
            if (!searchMatch) return false;
        }
        if (currentForumFilters.category && post.category !== currentForumFilters.category) return false;
        if (currentForumFilters.location && post.location !== currentForumFilters.location) return false;
        return true;
    });
}

function sortPosts() {
    const sortByEl = safeGet('forumSort');
    const sortBy = sortByEl ? sortByEl.value : currentForumSort;
    currentForumSort = sortBy;

    switch (sortBy) {
        case 'popular':
            filteredForumPosts.sort((a, b) => b.upvotes - a.upvotes);
            break;
        case 'answers':
            filteredForumPosts.sort((a, b) => b.answers - a.answers);
            break;
        case 'recent':
        default:
            filteredForumPosts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return b.upvotes - a.upvotes;
            });
            break;
    }

    renderForumPosts();
}

function updateForumResultsCount() {
    const count = filteredForumPosts.length;
    const el = safeGet('forumResultsCount');
    if (el) el.textContent = `${count} Question${count !== 1 ? 's' : ''} Found`;
}

function updateForumFilterInfo() {
    const category = currentForumFilters.category || 'All Categories';
    const el = safeGet('activeFilterInfo');
    if (el) el.textContent = category;
}

function renderForumPosts() {
    const container = safeGet('forumQuestions');
    const noResults = safeGet('forumNoResults');
    if (!container) return;

    if (!filteredForumPosts || filteredForumPosts.length === 0) {
        container.style.display = 'block';
        if (noResults) noResults.style.display = 'block';
        container.innerHTML = ''; // clear
        return;
    }

    container.style.display = 'flex';
    if (noResults) noResults.style.display = 'none';

    container.innerHTML = filteredForumPosts.map(post => createQuestionCard(post)).join('');
}

function createQuestionCard(post) {
    const answers = forumAnswers[post.id] || [];
    const isExpanded = expandedPost === post.id;
    const badges = [];
    if (post.featured) badges.push('<span class="question-badge featured">Featured</span>');
    if (post.isAnswered) badges.push('<span class="question-badge answered">Answered</span>');
    const pgNameHTML = post.pgName ? `<div class="question-pg-name"><i class="fas fa-tag"></i> ${post.pgName}</div>` : '';
    const tagsHTML = (post.tags || []).map(tag => `<span class="question-tag">#${tag}</span>`).join('');
    const expandedContent = isExpanded ? createExpandedContent(post, answers) : '';

    return `
        <div class="question-card" onclick="toggleQuestion('${post.id}')">
            <div class="question-header">
                <div class="question-author">
                    <!--<img src="${post.author?.avatar || ''}" alt="${post.author?.name || ''}" class="author-avatar">-->
                    <div class="author-info">
                        <div class="author-name">${post.author?.name || 'Unknown'}</div>
                        <div class="question-meta">
                            <i class="fas fa-clock"></i>
                            <span>${post.timestamp || ''}</span>
                            <span>•</span>
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${post.location || ''}</span>
                        </div>
                    </div>
                </div>
            </div>
            <h3 class="question-title">${post.title}</h3>
            <p class="question-content">${isExpanded ? post.content : (post.content?.length > 150 ? post.content.substring(0,150) + '...' : post.content)}</p>
            ${pgNameHTML}
            <div class="question-tags">${tagsHTML}</div>
            <div class="question-stats">
                <div class="question-actions">
                    <button class="question-action" onclick="event.stopPropagation(); upvotePost('${post.id}')">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${post.upvotes || 0}</span>
                    </button>
                    <div class="question-action">
                        <i class="fas fa-comment"></i>
                        <span>${answers.length} answer${answers.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="question-badges">${badges.join('')}</div>
            </div>
            ${expandedContent}
        </div>
    `;
}

function createExpandedContent(post, answers) {
    const answersHTML = (answers || []).map(answer => {
        const verifiedBadge = answer.isVerified ? '<span class="answer-badge verified"><i class="fas fa-shield-alt"></i> Verified Resident</span>' : '';
        const helpfulBadge = answer.helpful ? '<span class="answer-badge helpful"><i class="fas fa-star"></i> Helpful</span>' : '';
        return `
            <div class="answer-card">
                <div class="answer-header">
                    <!--<img src="${answer.author?.avatar || ''}" alt="${answer.author?.name || ''}" class="answer-author-avatar">-->
                    <div class="answer-author-info">
                        <div class="answer-author-name">${answer.author?.name || 'Unknown'}</div>
                        <div class="answer-meta">${verifiedBadge} ${helpfulBadge} <span>${answer.timestamp || ''}</span></div>
                    </div>
                </div>
                <p class="answer-content">${answer.content}</p>
                <div class="answer-actions">
                    <button class="answer-upvote" onclick="upvoteAnswer('${answer.id}')">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${answer.upvotes || 0}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="question-expanded">
            <h4 class="answers-header">${answers.length} Answer${answers.length !== 1 ? 's' : ''}</h4>
            <div class="answers-list">${answersHTML}</div>
            <div class="answer-form" onclick="event.stopPropagation();">
                <label for = 'name' class="filter-label">Your name</label>
                <input type = 'text' id = 'name' class = '' placeholder = 'Enter your name'></input>
                <label class="filter-label">Your Answer</label>
                <textarea id="newAnswer-${post.id}" placeholder="Share your experience or knowledge..." rows="3"></textarea>
                <button class="btn btn-primary" onclick="submitAnswer('${post.id}')"><i class="fas fa-paper-plane"></i> Post Answer</button>
            </div>
        </div>
    `;
}

function toggleQuestion(postId) {
    expandedPost = (expandedPost === postId) ? null : postId;
    renderForumPosts();
}

function upvotePost(postId) {
    const post = forumPosts.find(p => p.id === postId);
    if (post) {
        post.upvotes = (post.upvotes || 0) + 1;
        renderForumPosts();
    }
}

function upvoteAnswer(answerId) {
    for (const postAnswers of Object.values(forumAnswers)) {
        const answer = postAnswers.find(a => a.id === answerId);
        if (answer) {
            answer.upvotes = (answer.upvotes || 0) + 1;
            renderForumPosts();
            break;
        }
    }
}

async function submitAnswer(postId) {
  const textarea = safeGet(`newAnswer-${postId}`);
  const content = textarea ? textarea.value.trim() : '';
  const nameInput = safeGet('name');
  const authorName = nameInput ? nameInput.value.trim() : "Anonymous";

  if (!content) return;

  // ✅ Send to backend
  const res = await fetch(`http://localhost:5000/questions/${postId}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: authorName,
      content
    })
  });

  const data = await res.json();
  console.log("Saved answer:", data);

  // update UI
  if (!forumAnswers[postId]) forumAnswers[postId] = [];
  forumAnswers[postId].push(data);

  const post = forumPosts.find(p => p.id === postId);
  if (post) {
    post.answers++;
    post.isAnswered = true;
  }

  textarea.value = '';
  renderForumPosts();
}


// Question modal functions (guarded)
function openQuestionModal() {
    const q = safeGet('questionModal');
    if (q) q.classList.add('active');
}
function closeQuestionModal() {
    const q = safeGet('questionModal');
    if (q) q.classList.remove('active');
    const form = safeGet('questionForm');
    if (form) form.reset();
}
async function submitQuestion() {
  const titleEl = safeGet('questionTitle'), 
        contentEl = safeGet('questionContent'),
        nameEl = safeGet('yourName');

  if (!titleEl || !contentEl || !nameEl) return;
  const title = titleEl.value.trim();
  const content = contentEl.value.trim();
  const name = nameEl.value.trim();

  if (!title || !content || !name) {
    alert('Please fill in all required fields');
    return;
  }

  // ✅ Send to backend
  const res = await fetch("http://localhost:5000/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      title,
      content,
      location: safeValue('questionLocation', 'Not specified'),
      pgName: safeValue('questionPgName', ''),
      tags: safeValue('questionTags', '')
    })
  });

  const data = await res.json();
  console.log("Saved question:", data);

  // update UI
  forumPosts.unshift(data);
  filteredForumPosts = [...forumPosts];
  applyForumFilters();
  closeQuestionModal();
  renderForumPosts();
  updateForumResultsCount();
}


// Mobile forum helpers (guarded)
function toggleForumFilters() {
    const modal = document.getElementById('mobileForumFilters');
    if (modal) {
        modal.classList.toggle('active');
    }
}

function syncMobileSearch() {
    const mobileSearch = safeGet('mobileForumSearch');
    const desktopSearch = safeGet('forumSearch');
    if (mobileSearch && desktopSearch) {
        desktopSearch.value = mobileSearch.value;
        filterPosts();
    }
}
function syncMobileFilters() {
    const mCat = safeGet('mobileForumCategory');
    const mLoc = safeGet('mobileForumLocation');
    const cat = safeGet('forumCategory');
    const loc = safeGet('forumLocation');
    if (mCat && cat) cat.value = mCat.value;
    if (mLoc && loc) loc.value = mLoc.value;
    filterPosts();
}
function clearForumFilters() {
    const forumSearch = safeGet('forumSearch'); if (forumSearch) forumSearch.value = '';
    const fCat = safeGet('forumCategory'); if (fCat) fCat.value = '';
    const fLoc = safeGet('forumLocation'); if (fLoc) fLoc.value = '';
    const fSort = safeGet('forumSort'); if (fSort) fSort.value = 'recent';
    const mSearch = safeGet('mobileForumSearch'); if (mSearch) mSearch.value = '';
    const mCat = safeGet('mobileForumCategory'); if (mCat) mCat.value = '';
    const mLoc = safeGet('mobileForumLocation'); if (mLoc) mLoc.value = '';
    currentForumFilters = { search: '', category: '', location: '' };
    currentForumSort = 'recent';
    filteredForumPosts = [...forumPosts];
    renderForumPosts();
    updateForumResultsCount();
    updateForumFilterInfo();
}

function saveForumToLocalStorage() {
    localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
    localStorage.setItem('forumAnswers', JSON.stringify(forumAnswers));
}

window.addEventListener('load', () => {
    saveForumToLocalStorage
    loadForumFromLocalStorage();
    initializeForum();
});

function loadForumFromLocalStorage() {
    const posts = localStorage.getItem('forumPosts');
    const answers = localStorage.getItem('forumAnswers');

    if (posts) forumPosts.splice(0, forumPosts.length, ...JSON.parse(posts));
    if (answers) {
        const parsed = JSON.parse(answers);
        Object.keys(parsed).forEach(key => forumAnswers[key] = parsed[key]);
    }

    filteredForumPosts = [...forumPosts]; // keep filtered copy in sync
}

window.addEventListener('load', () => {
    loadForumFromLocalStorage();
    initializeForum();
});


function initializeForum() {
    // 1. Load saved data from localStorage first
    loadForumFromLocalStorage();

    // 2. Render the UI
    renderForumPosts();
    updateForumResultsCount();
    updateForumFilterInfo();

    // 3. Wire up form submit
    const questionForm = safeGet('questionForm');
    if (questionForm) {
        questionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitQuestion();
        });
    }
}


// Close modals on clicking outside already handled in setupEventListeners

// ====================== End of file ======================
