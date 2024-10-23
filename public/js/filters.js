// public/js/filters.js

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-button');
    const minAgeInput = document.getElementById('min-age-input');
    const remunerationMinInput = document.getElementById('remuneration-min-input');
    const remunerationMaxInput = document.getElementById('remuneration-max-input');
    const dateStartInput = document.getElementById('date-start-input');
    const dateEndInput = document.getElementById('date-end-input');
    const selectedFiltersContainer = document.getElementById('selected-filters-container');
    const filterForm = document.querySelector('form[action="/jobs"]');

    let selectedMissionTypes = [];
    let selectedContractTypes = [];
    let selectedMinAge = '';
    let selectedRemunerationMin = '';
    let selectedRemunerationMax = '';
    let selectedDateStart = '';
    let selectedDateEnd = '';

    // Function to update selected filters display
    function updateSelectedFiltersDisplay() {
        selectedFiltersContainer.innerHTML = '';

        // Mission Types
        selectedMissionTypes.forEach((type) => {
            const bubble = createFilterBubble(type.charAt(0).toUpperCase() + type.slice(1), 'MissionType');
            selectedFiltersContainer.appendChild(bubble);
        });

        // Contract Types
        selectedContractTypes.forEach((type) => {
            const bubble = createFilterBubble(type.toUpperCase(), 'ContractType');
            selectedFiltersContainer.appendChild(bubble);
        });

        // Minimum Age
        if (selectedMinAge) {
            const bubble = createFilterBubble(`Âge Min: ${selectedMinAge}`, 'MinAge');
            selectedFiltersContainer.appendChild(bubble);
        }

        // Remuneration Range
        if (selectedRemunerationMin || selectedRemunerationMax) {
            let text = 'Rémunération: ';
            if (selectedRemunerationMin && selectedRemunerationMax) {
                text += `€${selectedRemunerationMin} - €${selectedRemunerationMax}`;
            } else if (selectedRemunerationMin) {
                text += `€${selectedRemunerationMin}+`;
            } else if (selectedRemunerationMax) {
                text += `Up to €${selectedRemunerationMax}`;
            }
            const bubble = createFilterBubble(text, 'Remuneration');
            selectedFiltersContainer.appendChild(bubble);
        }

        // Date Range
        if (selectedDateStart || selectedDateEnd) {
            let text = 'Date: ';
            if (selectedDateStart && selectedDateEnd) {
                text += `${selectedDateStart} - ${selectedDateEnd}`;
            } else if (selectedDateStart) {
                text += `À partir du ${selectedDateStart}`;
            } else if (selectedDateEnd) {
                text += `Jusqu'au ${selectedDateEnd}`;
            }
            const bubble = createFilterBubble(text, 'Date');
            selectedFiltersContainer.appendChild(bubble);
        }
    }

    // Function to create a filter bubble element
    function createFilterBubble(value, type) {
        const bubble = document.createElement('div');
        bubble.className = 'flex items-center px-3 py-1 bg-blue-950 mb-4 text-white rounded-full text-sm';

        const span = document.createElement('span');
        span.textContent = value;

        const removeButton = document.createElement('button');
        removeButton.className = 'ml-2 focus:outline-none';
        removeButton.innerHTML = '&times;';
        removeButton.addEventListener('click', () => {
            removeFilter(value, type);
        });

        bubble.appendChild(span);
        bubble.appendChild(removeButton);

        return bubble;
    }

    // Function to remove a filter
    function removeFilter(value, type) {
        if (type === 'MissionType') {
            selectedMissionTypes = selectedMissionTypes.filter(item => item !== value.toLowerCase());
            // Deselect the button
            const button = document.querySelector(`.filter-button[data-filter="${value.toLowerCase()}"][data-filter-type="MissionType"]`);
            if (button) button.click();
        } else if (type === 'ContractType') {
            selectedContractTypes = selectedContractTypes.filter(item => item !== value.toLowerCase());
            const button = document.querySelector(`.filter-button[data-filter="${value.toLowerCase()}"][data-filter-type="ContractType"]`);
            if (button) button.click();
        } else if (type === 'MinAge') {
            selectedMinAge = '';
            minAgeInput.value = '';
        } else if (type === 'Remuneration') {
            selectedRemunerationMin = '';
            selectedRemunerationMax = '';
            remunerationMinInput.value = '';
            remunerationMaxInput.value = '';
        } else if (type === 'Date') {
            selectedDateStart = '';
            selectedDateEnd = '';
            dateStartInput.value = '';
            dateEndInput.value = '';
        }

        updateSelectedFiltersDisplay();
        updateHiddenInputs();
        filterForm.submit();
    }

    // Function to update hidden inputs
    function updateHiddenInputs() {
        document.getElementById('selected-mission-types').value = selectedMissionTypes.join(',');
        document.getElementById('selected-contract-types').value = selectedContractTypes.join(',');
        document.getElementById('selected-min-age').value = selectedMinAge;
        document.getElementById('selected-remuneration-min').value = selectedRemunerationMin;
        document.getElementById('selected-remuneration-max').value = selectedRemunerationMax;
        document.getElementById('selected-date-start').value = selectedDateStart;
        document.getElementById('selected-date-end').value = selectedDateEnd;
    }

    // Event listener for filter buttons
    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Toggle 'active' state
            button.classList.toggle('active');

            // Visual feedback for active state
            if (button.classList.contains('active')) {
                button.classList.remove('bg-white', 'text-blue-950');
                button.classList.add('bg-blue-950', 'text-white');
            } else {
                button.classList.remove('bg-blue-950', 'text-white');
                button.classList.add('bg-white', 'text-blue-950');
            }

            // Get filter value and type
            const filterValue = button.getAttribute('data-filter');
            const filterType = button.getAttribute('data-filter-type');

            // Update the appropriate selected filters array based on filter type
            if (button.classList.contains('active')) {
                if (filterType === 'MissionType') {
                    if (!selectedMissionTypes.includes(filterValue)) {
                        selectedMissionTypes.push(filterValue);
                    }
                } else if (filterType === 'ContractType') {
                    if (!selectedContractTypes.includes(filterValue)) {
                        selectedContractTypes.push(filterValue);
                    }
                }
            } else {
                if (filterType === 'MissionType') {
                    selectedMissionTypes = selectedMissionTypes.filter(item => item !== filterValue);
                } else if (filterType === 'ContractType') {
                    selectedContractTypes = selectedContractTypes.filter(item => item !== filterValue);
                }
            }

            updateSelectedFiltersDisplay();
        });
    });

    // Event listeners for inputs
    minAgeInput.addEventListener('change', () => {
        selectedMinAge = minAgeInput.value;
        updateSelectedFiltersDisplay();
    });

    remunerationMinInput.addEventListener('change', () => {
        selectedRemunerationMin = remunerationMinInput.value;
        updateSelectedFiltersDisplay();
    });

    remunerationMaxInput.addEventListener('change', () => {
        selectedRemunerationMax = remunerationMaxInput.value;
        updateSelectedFiltersDisplay();
    });

    dateStartInput.addEventListener('change', () => {
        selectedDateStart = dateStartInput.value;
        updateSelectedFiltersDisplay();
    });

    dateEndInput.addEventListener('change', () => {
        selectedDateEnd = dateEndInput.value;
        updateSelectedFiltersDisplay();
    });

    // Before form submission, populate hidden inputs
    filterForm.addEventListener('submit', () => {
        updateHiddenInputs();
    });

    // Initialize selected filters if any (from URL parameters)
    function getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const queries = queryString.split('&');
        queries.forEach((query) => {
            const [key, value] = query.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        return params;
    }

    const params = getQueryParams();

    if (params.missionTypes) {
        selectedMissionTypes = params.missionTypes.split(',').filter(Boolean);
    }
    if (params.contractTypes) {
        selectedContractTypes = params.contractTypes.split(',').filter(Boolean);
    }
    if (params.minAge) {
        selectedMinAge = params.minAge;
        minAgeInput.value = selectedMinAge;
    }
    if (params.remunerationMin) {
        selectedRemunerationMin = params.remunerationMin;
        remunerationMinInput.value = selectedRemunerationMin;
    }
    if (params.remunerationMax) {
        selectedRemunerationMax = params.remunerationMax;
        remunerationMaxInput.value = selectedRemunerationMax;
    }
    if (params.dateStart) {
        selectedDateStart = params.dateStart;
        dateStartInput.value = selectedDateStart;
    }
    if (params.dateEnd) {
        selectedDateEnd = params.dateEnd;
        dateEndInput.value = selectedDateEnd;
    }

    // Update button states based on selected filters
    filterButtons.forEach((button) => {
        const filterValue = button.getAttribute('data-filter');
        const filterType = button.getAttribute('data-filter-type');

        if ((filterType === 'MissionType' && selectedMissionTypes.includes(filterValue)) ||
            (filterType === 'ContractType' && selectedContractTypes.includes(filterValue))) {
            button.classList.remove('active', 'bg-white', 'text-blue-950');
            button.classList.add('active', 'bg-blue-950', 'text-white');
        }
    });

    // Display selected filters on page load
    updateSelectedFiltersDisplay();
});
