document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-button');
    const minAgeInputs = document.querySelectorAll('.min-age-input');
    const remunerationMinInputs = document.querySelectorAll('.remuneration-min-input');
    const remunerationMaxInputs = document.querySelectorAll('.remuneration-max-input');
    const dateStartInputs = document.querySelectorAll('.date-start-input');
    const dateEndInputs = document.querySelectorAll('.date-end-input');
    const selectedFiltersContainer = document.getElementById('selected-filters-container');
    const filterForms = document.querySelectorAll('form[action="/jobs"]');

    let selectedMissionTypes = [];
    let selectedContractTypes = [];
    let selectedMinAge = '';
    let selectedRemunerationMin = '';
    let selectedRemunerationMax = '';
    let selectedDateStart = '';
    let selectedDateEnd = '';
    let selectedCities = [];

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

        // Cities
        selectedCities.forEach((city) => {
            const bubble = createFilterBubble(city, 'City');
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
        } else if (type === 'City') {
            selectedCities = selectedCities.filter((item) => item !== value);
            const button = document.querySelector(
                `.filter-button[data-filter="${value}"][data-filter-type="City"]`
            );
            if (button) button.click();
        } else if (type === 'MinAge') {
            selectedMinAge = '';
            minAgeInputs.forEach(input => input.value = '');
        } else if (type === 'Remuneration') {
            selectedRemunerationMin = '';
            selectedRemunerationMax = '';
            remunerationMinInputs.forEach(input => input.value = '');
            remunerationMaxInputs.forEach(input => input.value = '');
        } else if (type === 'Date') {
            selectedDateStart = '';
            selectedDateEnd = '';
            dateStartInputs.forEach(input => input.value = '');
            dateEndInputs.forEach(input => input.value = '');
        }

        updateSelectedFiltersDisplay();
        updateHiddenInputs();
        filterForms[0].submit(); // Submitting the first form as an example
    }

    // Function to update hidden inputs
    function updateHiddenInputs() {
        // Update all forms
        filterForms.forEach((form) => {
            form.querySelectorAll('.selected-mission-types').forEach(input => input.value = selectedMissionTypes.join(','));
            form.querySelectorAll('.selected-contract-types').forEach(input => input.value = selectedContractTypes.join(','));
            form.querySelectorAll('.selected-min-age').forEach(input => input.value = selectedMinAge);
            form.querySelectorAll('.selected-cities').forEach(input => input.value = selectedCities.join(','));
            form.querySelectorAll('.selected-remuneration-min').forEach(input => input.value = selectedRemunerationMin);
            form.querySelectorAll('.selected-remuneration-max').forEach(input => input.value = selectedRemunerationMax);
            form.querySelectorAll('.selected-date-start').forEach(input => input.value = selectedDateStart);
            form.querySelectorAll('.selected-date-end').forEach(input => input.value = selectedDateEnd);
        });
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
                } else if (filterType === 'City') {
                    if (!selectedCities.includes(filterValue)) {
                        selectedCities.push(filterValue);
                    }
                }
            } else {
                if (filterType === 'MissionType') {
                    selectedMissionTypes = selectedMissionTypes.filter(item => item !== filterValue);
                } else if (filterType === 'ContractType') {
                    selectedContractTypes = selectedContractTypes.filter(item => item !== filterValue);
                } else if (filterType === 'City') {
                    selectedCities = selectedCities.filter((item) => item !== filterValue);
                }
            }

            updateSelectedFiltersDisplay();
        });
    });

    // Event listeners for inputs
    function addInputListeners(inputs, updateSelectedValue) {
        inputs.forEach((input) => {
            input.addEventListener('change', () => {
                // Update the selected value based on the input that was changed
                updateSelectedValue(input.value);

                // Synchronize the value across all inputs of the same type
                inputs.forEach(i => {
                    if (i !== input) i.value = input.value;
                });

                updateSelectedFiltersDisplay();
            });
        });
    }

    // Add input listeners for each filter type
    addInputListeners(minAgeInputs, (value) => {
        selectedMinAge = value;
    });

    addInputListeners(remunerationMinInputs, (value) => {
        selectedRemunerationMin = value;
    });

    addInputListeners(remunerationMaxInputs, (value) => {
        selectedRemunerationMax = value;
    });

    addInputListeners(dateStartInputs, (value) => {
        selectedDateStart = value;
    });

    addInputListeners(dateEndInputs, (value) => {
        selectedDateEnd = value;
    });

    // Before form submission, populate hidden inputs
    filterForms.forEach((form) => {
        form.addEventListener('submit', () => {
            updateHiddenInputs();
        });
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
    if (params.cities) {
        selectedCities = params.cities.split(',').filter(Boolean);
    }
    if (params.minAge) {
        selectedMinAge = params.minAge;
        minAgeInputs.forEach(input => input.value = selectedMinAge);
    }
    if (params.remunerationMin) {
        selectedRemunerationMin = params.remunerationMin;
        remunerationMinInputs.forEach(input => input.value = selectedRemunerationMin);
    }
    if (params.remunerationMax) {
        selectedRemunerationMax = params.remunerationMax;
        remunerationMaxInputs.forEach(input => input.value = selectedRemunerationMax);
    }
    if (params.dateStart) {
        selectedDateStart = params.dateStart;
        dateStartInputs.forEach(input => input.value = selectedDateStart);
    }
    if (params.dateEnd) {
        selectedDateEnd = params.dateEnd;
        dateEndInputs.forEach(input => input.value = selectedDateEnd);
    }

    // Update button states based on selected filters
    filterButtons.forEach((button) => {
        const filterValue = button.getAttribute('data-filter');
        const filterType = button.getAttribute('data-filter-type');

        if ((filterType === 'MissionType' && selectedMissionTypes.includes(filterValue)) ||
            (filterType === 'City' && selectedCities.includes(filterValue)) ||
            (filterType === 'ContractType' && selectedContractTypes.includes(filterValue))) {
            button.classList.add('active', 'bg-blue-950', 'text-white');
            button.classList.remove('bg-white', 'text-blue-950');
        }
    });

    // Display selected filters on page load
    updateSelectedFiltersDisplay();
});
