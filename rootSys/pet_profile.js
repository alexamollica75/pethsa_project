// ---- State ----
let mode = 'add'; // 'add' | 'view' | 'edit'
let breedRows = [];
let breedRowCounter = 0;

// ============================================================
// REFERENCE DATA (replace with real API calls where noted)
// ============================================================
const petTypes = [
    { petTypeId: 1, type: 'Dog' },
    { petTypeId: 2, type: 'Cat' },
    { petTypeId: 3, type: 'Bird' },
    { petTypeId: 4, type: 'Rabbit' },
    { petTypeId: 5, type: 'Reptile' },
    { petTypeId: 6, type: 'Small Mammal' },
    { petTypeId: 7, type: 'Other' },
];

// Breeds grouped by petTypeId. TODO: replace with a real breed lookup API call per pet type.
const breedsByPetType = {
    1: [
        { breedId: 101, breed: 'Labrador Retriever' },
        { breedId: 102, breed: 'German Shepherd' },
        { breedId: 103, breed: 'Golden Retriever' },
        { breedId: 104, breed: 'French Bulldog' },
        { breedId: 105, breed: 'Poodle' },
        { breedId: 106, breed: 'Beagle' },
        { breedId: 107, breed: 'Chihuahua' },
        { breedId: 108, breed: 'Mixed Breed' },
    ],
    2: [
        { breedId: 201, breed: 'Domestic Shorthair' },
        { breedId: 202, breed: 'Domestic Longhair' },
        { breedId: 203, breed: 'Siamese' },
        { breedId: 204, breed: 'Maine Coon' },
        { breedId: 205, breed: 'Persian' },
        { breedId: 206, breed: 'Ragdoll' },
        { breedId: 207, breed: 'Mixed Breed' },
    ],
    3: [
        { breedId: 301, breed: 'Parakeet' },
        { breedId: 302, breed: 'Cockatiel' },
        { breedId: 303, breed: 'Parrot' },
        { breedId: 304, breed: 'Canary' },
    ],
    4: [
        { breedId: 401, breed: 'Holland Lop' },
        { breedId: 402, breed: 'Netherland Dwarf' },
        { breedId: 403, breed: 'Rex' },
        { breedId: 404, breed: 'Mixed Breed' },
    ],
    5: [
        { breedId: 501, breed: 'Bearded Dragon' },
        { breedId: 502, breed: 'Leopard Gecko' },
        { breedId: 503, breed: 'Ball Python' },
        { breedId: 504, breed: 'Turtle' },
    ],
    6: [
        { breedId: 601, breed: 'Hamster' },
        { breedId: 602, breed: 'Guinea Pig' },
        { breedId: 603, breed: 'Ferret' },
    ],
    7: [{ breedId: 701, breed: 'Other / Unknown' }],
};

const esimatedSize = [
    { id: 'toy', value: 'Toy (under 12 lbs)' },
    { id: 'small', value: 'Small (15-30 lbs)' },
    { id: 'medium', value: 'Medium (30-60 lbs)' },
    { id: 'large', value: 'Large (60-90 lbs)' },
    { id: 'giant', value: 'Giant (90+ lbs)' },
];

const petGender = [
    { id: 'male', value: 'Male' },
    { id: 'female', value: 'Female' },
    { id: 'unknown', value: 'Unknown' },
];

const filteredSpayedNeutered = [
    { id: 'yes', value: 'Yes' },
    { id: 'no', value: 'No' },
    { id: 'unknown', value: 'Unknown' },
];

const adoptionSource = [
    { id: 'breeder', value: 'Breeder' },
    { id: 'rescue', value: 'Rescue Organization' },
    { id: 'shelter', value: 'Animal Shelter' },
    { id: 'friend_family', value: 'Friend / Family' },
    { id: 'found', value: 'Found' },
    { id: 'other', value: 'Other' },
];

const ownedFostered = [
    { id: 'owned', value: 'Owned' },
    { id: 'fostered', value: 'Fostered' },
];

const commonIssues = [
    { issueId: 1, issueName: 'Allergies' },
    { issueId: 2, issueName: 'Arthritis' },
    { issueId: 3, issueName: 'Diabetes' },
    { issueId: 4, issueName: 'Heart Disease' },
    { issueId: 5, issueName: 'Hip Dysplasia' },
    { issueId: 6, issueName: 'Kidney Disease' },
    { issueId: 7, issueName: 'Obesity' },
    { issueId: 8, issueName: 'Seizures/Epilepsy' },
    { issueId: 9, issueName: 'Skin Conditions' },
    { issueId: 10, issueName: 'None Known' },
];

const tagOptions = [
    { value: 'Friendly' },
    { value: 'Anxious' },
    { value: 'Reactive' },
    { value: 'Senior' },
    { value: 'Special Needs' },
    { value: 'Service Animal' },
];

const vaccineOptions = [
    { id: 'rabies', name: 'Rabies' },
    { id: 'distemper', name: 'Distemper (DHPP)' },
    { id: 'parvovirus', name: 'Parvovirus' },
    { id: 'bordetella', name: 'Bordetella (Kennel Cough)' },
    { id: 'lyme', name: 'Lyme Disease' },
    { id: 'fvrcp', name: 'FVRCP (Feline)' },
    { id: 'felv', name: 'Feline Leukemia (FeLV)' },
    { id: 'other', name: 'Other' },
];

const vaccineDoseTypes = [
    { id: '1yr', name: '1-Year' },
    { id: '3yr', name: '3-Year' },
    { id: 'titer', name: 'Titer Test' },
    { id: 'booster', name: 'Booster' },
];

const medicationFrequencyUnits = [
    { id: 'once_daily', name: 'Once Daily' },
    { id: 'twice_daily', name: 'Twice Daily' },
    { id: 'three_times_daily', name: 'Three Times Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'biweekly', name: 'Every Other Week' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'as_needed', name: 'As Needed (PRN)' },
];

const medicationAdminMethods = [
    { id: 'oral', name: 'Oral' },
    { id: 'topical', name: 'Topical' },
    { id: 'injection', name: 'Injection' },
    { id: 'eye_drops', name: 'Eye Drops' },
    { id: 'ear_drops', name: 'Ear Drops' },
    { id: 'chewable', name: 'Chewable' },
    { id: 'other', name: 'Other' },
];

const medicationAdminConditions = [
    { id: 'with_food', name: 'With Food' },
    { id: 'empty_stomach', name: 'On Empty Stomach' },
    { id: 'no_restriction', name: 'No Restriction' },
    { id: 'avoid_sun', name: 'Avoid Sun Exposure' },
    { id: 'other', name: 'Other' },
];

// ============================================================
// DROPDOWN POPULATION
// ============================================================
function fillSelect(selectEl, items, valueKey, labelKey, placeholder) {
    if (!selectEl) return;
    const currentValue = selectEl.value;
    selectEl.innerHTML = '';

    if (placeholder) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = placeholder;
        selectEl.appendChild(opt);
    }

    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item[valueKey];
        opt.textContent = item[labelKey];
        selectEl.appendChild(opt);
    });

    if (currentValue) selectEl.value = currentValue;
}

function populateBreedDropdown(petTypeId) {
    const breedSelect = document.getElementById('breedId');
    const breeds = breedsByPetType[petTypeId] || [];
    fillSelect(breedSelect, breeds, 'breedId', 'breed', 'Select breed');
}

function populateAllDropdowns() {
    fillSelect(document.getElementById('petTypeId'), petTypes, 'petTypeId', 'type', 'Select pet type');
    fillSelect(document.getElementById('size'), esimatedSize, 'id', 'value', 'Select estimated size');
    fillSelect(document.getElementById('gender'), petGender, 'id', 'value', 'Select pet gender');
    fillSelect(document.getElementById('spayed'), filteredSpayedNeutered, 'id', 'value', 'Select spayed/neutered');
    fillSelect(document.getElementById('rescueBreeder'), adoptionSource, 'id', 'value', 'Select adoption source');
    fillSelect(document.getElementById('fostered'), ownedFostered, 'id', 'value', 'Select owned/fostered');
    fillSelect(document.getElementById('ailments'), commonIssues, 'issueId', 'issueName', null);
    fillSelect(document.getElementById('petHistory'), commonIssues, 'issueId', 'issueName', 'Select known bloodline ailments');
    fillSelect(document.getElementById('tags'), tagOptions, 'value', 'value', 'Select tag');
    fillSelect(document.getElementById('vaccineDoseType'), vaccineDoseTypes, 'id', 'name', 'Select Dosage');
    fillSelect(document.getElementById('medicationFrequencyUnit'), medicationFrequencyUnits, 'id', 'name', 'Select frequency unit');
    fillSelect(document.getElementById('medicationAdminMethod'), medicationAdminMethods, 'id', 'name', 'Select method');
    fillSelect(document.getElementById('medicationAdminConditions'), medicationAdminConditions, 'id', 'name', 'Select medication condition');

    // Breed depends on the currently selected pet type (default to Dog's list until a type is chosen)
    populateBreedDropdown(document.getElementById('petTypeId').value || 1);
}

document.getElementById('petTypeId').addEventListener('change', (e) => {
    populateBreedDropdown(e.target.value);
});

// ---- Elements ----
const form = document.getElementById('petForm');
const submitTopLabel = document.getElementById('submitTopLabel');
const submitBottomLabel = document.getElementById('submitBottomLabel');
const validationSummary = document.getElementById('validationSummary');

const inputsToDisableInView = [
    'name', 'lastName', 'petTypeId', 'breedId', 'size', 'weight', 'gender',
    'spayed', 'rescueBreeder', 'birthdate', 'unknown', 'age', 'fostered',
    'ailments', 'petHistory', 'petAdaptationDate', 'microNumber', 'tagNumber',
    'licenseId', 'tags', 'isServiceAnimal', 'isESA'
];

function setMode(newMode) {
    mode = newMode;
    const isView = mode === 'view';

    inputsToDisableInView.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = isView;
    });

    document.getElementById('btnAddPhoto').disabled = isView;
    document.getElementById('btnRemovePhoto').disabled = isView;

    submitTopLabel.textContent = 'Submit';
    submitBottomLabel.textContent = 'Submit';

    const editIcons = document.querySelectorAll('#btnEditTop i, #btnEditSection i, #btnEditBottom i, #btnEditMixedBreed i');
    editIcons.forEach(i => {
        i.classList.toggle('fa-xmark', !isView);
        i.classList.toggle('fa-pen-to-square', isView);
    });

    document.getElementById('btnSubmitTop').style.display = isView ? 'none' : 'inline-flex';
    document.getElementById('btnSubmitBottom').style.display = isView ? 'none' : 'inline-flex';
}

function toggleEditMode() {
    setMode(mode === 'view' ? 'edit' : 'view');
}

['btnEditTop', 'btnEditSection', 'btnEditBottom', 'btnEditMixedBreed'].forEach(id => {
    document.getElementById(id).addEventListener('click', toggleEditMode);
});

document.getElementById('btnGoBack').addEventListener('click', () => {
    window.history.back();
});

// ---- Unknown birthdate / estimated age toggle ----
const unknownCheckbox = document.getElementById('unknown');
const birthdateInput = document.getElementById('birthdate');
const ageInput = document.getElementById('age');
const birthdateRequiredMark = document.getElementById('birthdateRequiredMark');
const ageRequiredMark = document.getElementById('ageRequiredMark');

unknownCheckbox.addEventListener('change', () => {
    const isUnknown = unknownCheckbox.checked;
    birthdateInput.disabled = isUnknown;
    birthdateRequiredMark.style.display = isUnknown ? 'none' : 'inline';
    ageRequiredMark.style.display = isUnknown ? 'inline' : 'none';
});

// ---- Image upload ----
const fileInput = document.getElementById('fileInput');
const petImagePreview = document.getElementById('petImagePreview');
const imageLoadingOverlay = document.getElementById('imageLoadingOverlay');

document.getElementById('btnAddPhoto').addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    imageLoadingOverlay.style.display = 'flex';
    const reader = new FileReader();
    reader.onload = (evt) => {
        petImagePreview.src = evt.target.result;
        imageLoadingOverlay.style.display = 'none';
    };
    reader.readAsDataURL(file);
});

document.getElementById('btnRemovePhoto').addEventListener('click', () => {
    petImagePreview.src = 'assets/images/pet-avatar.png';
    fileInput.value = '';
});

// ---- Mixed breed table ----
const isMixBreedCheckbox = document.getElementById('isMixBreed');
const mixedBreedTableWrapper = document.getElementById('mixedBreedTableWrapper');
const breedTableBody = document.getElementById('breedTableBody');
const totalBreedPercentageLabel = document.getElementById('totalBreedPercentage');
const totalPercentageError = document.getElementById('totalPercentageError');

// Combined breed list across all pet types, for the mixed-breed rows.
// TODO: filter this to just the pet's own species if desired.
const breedOptions = Object.values(breedsByPetType).flat();

isMixBreedCheckbox.addEventListener('change', () => {
    const checked = isMixBreedCheckbox.checked;
    mixedBreedTableWrapper.style.display = checked ? 'block' : 'none';
    if (checked && breedRows.length < 2) {
        addBreedRow();
        addBreedRow();
    }
});

function addBreedRow() {
    const rowId = breedRowCounter++;
    breedRows.push({ id: rowId, breedId: null, percentage: null });
    renderBreedRows();
}

function deleteBreedRow(rowId) {
    breedRows = breedRows.filter(r => r.id !== rowId);
    renderBreedRows();
}

function renderBreedRows() {
    breedTableBody.innerHTML = '';
    breedRows.forEach((row, index) => {
        const tr = document.createElement('tr');

        const breedTd = document.createElement('td');
        const breedSelect = document.createElement('select');
        breedSelect.innerHTML = '<option value="">Select breed</option>' +
            breedOptions.map(b => `<option value="${b.breedId}">${b.breed}</option>`).join('');
        breedSelect.value = row.breedId || '';
        breedSelect.disabled = mode === 'view' || index === 0;
        breedSelect.addEventListener('change', (e) => {
            row.breedId = e.target.value;
            renderBreedRows();
        });
        breedTd.appendChild(breedSelect);
        if (!row.breedId) {
            const err = document.createElement('div');
            err.className = 'table-error-message';
            err.textContent = 'Breed is required';
            breedTd.appendChild(err);
        }

        const pctTd = document.createElement('td');
        const pctInput = document.createElement('input');
        pctInput.type = 'number';
        pctInput.placeholder = '%';
        pctInput.value = row.percentage ?? '';
        pctInput.disabled = mode === 'view';
        pctInput.addEventListener('input', (e) => {
            row.percentage = parseFloat(e.target.value) || 0;
            updateTotalPercentage();
        });
        pctTd.appendChild(pctInput);
        if (!row.percentage) {
            const err = document.createElement('div');
            err.className = 'table-error-message';
            err.textContent = 'Percentage is required';
            pctTd.appendChild(err);
        }

        const actionsTd = document.createElement('td');
        const actionsWrap = document.createElement('div');
        actionsWrap.className = 'breed-actions-container';

        if (mode !== 'view' && index >= 2) {
            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-pet-button';
            removeBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            removeBtn.addEventListener('click', () => deleteBreedRow(row.id));
            actionsWrap.appendChild(removeBtn);
        }
        if (index === 0 && mode !== 'view') {
            const addBtn = document.createElement('span');
            addBtn.className = 'add-pet-button';
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            addBtn.addEventListener('click', addBreedRow);
            actionsWrap.appendChild(addBtn);
        }
        actionsTd.appendChild(actionsWrap);

        tr.appendChild(breedTd);
        tr.appendChild(pctTd);
        tr.appendChild(actionsTd);
        breedTableBody.appendChild(tr);
    });

    updateTotalPercentage();
}

function updateTotalPercentage() {
    const total = breedRows.reduce((sum, r) => sum + (r.percentage || 0), 0);
    totalBreedPercentageLabel.textContent = total + '%';
    totalPercentageError.style.display = total !== 100 ? 'block' : 'none';
}

document.getElementById('btnAddBreedRow').addEventListener('click', addBreedRow);

// ---- Microchip number validation ----
const microNumberInput = document.getElementById('microNumber');
const microNumberError = document.getElementById('microNumberError');

microNumberInput.addEventListener('input', () => {
    const val = microNumberInput.value.replace(/\D/g, '');
    microNumberInput.value = val;
    const valid = val.length === 0 || (val.length >= 9 && val.length <= 15);
    microNumberError.style.display = valid ? 'none' : 'block';
    microNumberInput.classList.toggle('error-border', !valid);
});

// ---- Basic required-field validation ----
function validateForm() {
    let valid = true;

    const requiredFields = [
        { id: 'name', errorId: 'nameError' },
        { id: 'petTypeId', errorId: 'petTypeError' },
        { id: 'breedId', errorId: 'breedError' },
        { id: 'weight', errorId: 'weightRequiredError' },
        { id: 'gender', errorId: 'genderError' },
        { id: 'spayed', errorId: 'spayedError' },
        { id: 'rescueBreeder', errorId: 'adoptionSourceError' },
        { id: 'fostered', errorId: 'fosteredError' },
    ];

    requiredFields.forEach(({ id, errorId }) => {
        const el = document.getElementById(id);
        const errEl = document.getElementById(errorId);
        const isEmpty = !el.value;
        if (errEl) errEl.style.display = isEmpty ? 'block' : 'none';
        if (isEmpty) valid = false;
    });

    if (!unknownCheckbox.checked && !birthdateInput.value) {
        document.getElementById('birthdateError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('birthdateError').style.display = 'none';
    }

    if (unknownCheckbox.checked && !ageInput.value) {
        document.getElementById('ageError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('ageError').style.display = 'none';
    }

    validationSummary.style.display = valid ? 'none' : 'flex';
    return valid;
}

function collectFormData() {
    return {
        name: document.getElementById('name').value,
        lastName: document.getElementById('lastName').value,
        petTypeId: document.getElementById('petTypeId').value,
        breedId: document.getElementById('breedId').value,
        size: document.getElementById('size').value,
        weight: document.getElementById('weight').value,
        gender: document.getElementById('gender').value,
        spayed: document.getElementById('spayed').value,
        rescueBreeder: document.getElementById('rescueBreeder').value,
        birthdate: document.getElementById('birthdate').value,
        unknown: unknownCheckbox.checked,
        age: document.getElementById('age').value,
        fostered: document.getElementById('fostered').value,
        petAdaptationDate: document.getElementById('petAdaptationDate').value,
        microNumber: document.getElementById('microNumber').value,
        tagNumber: document.getElementById('tagNumber').value,
        licenseId: document.getElementById('licenseId').value,
        isServiceAnimal: document.getElementById('isServiceAnimal').checked,
        isESA: document.getElementById('isESA').checked,
        isMixBreed: isMixBreedCheckbox.checked,
        breeds: breedRows,
    };
}

async function onSubmit() {
    if (!validateForm()) return;

    const payload = collectFormData();

    try {
        const res = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        console.log('Saved:', data);
        showCalcModal();
    } catch (err) {
        console.error('Submit failed:', err);
    }
}

document.getElementById('btnSubmitTop').addEventListener('click', (e) => { e.preventDefault(); onSubmit(); });
document.getElementById('btnSubmitBottom').addEventListener('click', (e) => { e.preventDefault(); onSubmit(); });

// ---- Pet calculator redirect modal ----
const calcModal = document.getElementById('calcModal');
const calcModalBackdrop = document.getElementById('calcModalBackdrop');

function showCalcModal() {
    calcModal.style.display = 'flex';
    calcModalBackdrop.style.display = 'block';
}
function closeCalcModal() {
    calcModal.style.display = 'none';
    calcModalBackdrop.style.display = 'none';
}

document.getElementById('btnCloseCalcModal').addEventListener('click', closeCalcModal);
document.getElementById('btnSkipCalc').addEventListener('click', closeCalcModal);
calcModalBackdrop.addEventListener('click', closeCalcModal);
document.getElementById('btnGoToCalc').addEventListener('click', () => {
    window.location.href = '/pet-calculator';
});

// ============================================================
// SAMPLE DATA (replace with real API calls)
// ============================================================
let coOwners = []; // { name, email, phone, emergencyContact, emergencyPhone, isCoOwner, status }
let vaccineRecords = []; // { vaccineName, dateGiven, nextDueDate, doseType, status, loggedBy }
let medications = []; // { medicationName, dosage, frequency, status, nextOrderDate, dateStarted, loggedBy }
const registeredUsers = []; // { label, email, phone } - populate from your users API

// ============================================================
// GENERIC LIST RENDERERS
// ============================================================
function renderCoOwners() {
    const body = document.getElementById('coOwnersBody');
    const empty = document.getElementById('coOwnersEmpty');
    body.innerHTML = '';

    if (coOwners.length === 0) {
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    coOwners.forEach((row, idx) => {
        const div = document.createElement('div');
        div.className = 'list-row';
        div.innerHTML = `
      <div class="list-col">${row.name || '—'}</div>
      <div class="list-col">${row.email || '—'}</div>
      <div class="list-col">${row.phone || '—'}</div>
      <div class="list-col">${row.emergencyContact || '—'}</div>
      <div class="list-col">${row.emergencyPhone || '—'}</div>
      <div class="list-col">${row.isCoOwner ? 'Yes' : 'No'}</div>
      <div class="list-col">${row.status || '—'}</div>
      <div class="list-col list-col--actions">
        <button type="button" class="list-action-btn" data-idx="${idx}" data-action="edit-coowner"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="list-action-btn" data-idx="${idx}" data-action="delete-coowner"><i class="fa-solid fa-trash-can"></i></button>
      </div>`;
        body.appendChild(div);
    });
}
function uploadPetDocument(context) {
    console.log('uploadPetDocument called with context:', context); // remove once confirmed working

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/heic,image/heif,.heic,.heif,application/pdf';
    input.style.display = 'none';
    document.body.appendChild(input); // attach to DOM — some browsers won't open the dialog on a detached input

    input.onchange = async (e) => {
        const file = e.target.files[0];
        document.body.removeChild(input); // clean up regardless of outcome
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        const allowedExt = ['jpg', 'jpeg', 'png', 'pdf', 'heic', 'heif'];
        const maxBytes = 10 * 1024 * 1024;

        if (!allowedExt.includes(ext)) {
            alert(`"${file.name}" isn't a supported file type. Please use .jpeg, .png, .pdf, .heic, or .heif.`);
            return;
        }
        if (file.size > maxBytes) {
            alert(`"${file.name}" is larger than 10MB. Please choose a smaller file.`);
            return;
        }

        const isHeic = ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';
        if (isHeic && typeof heic2any === 'function') {
            try {
                const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
                console.log('HEIC preview available at:', URL.createObjectURL(convertedBlob));
            } catch (err) {
                console.warn('HEIC conversion failed, proceeding with upload anyway:', err);
            }
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('context', context);

        try {
            const res = await fetch('/api/pet-document-upload', { method: 'POST', body: formData });
            const data = await res.json();
            console.log('Uploaded:', data);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed. Please try again.');
        }
    };

    input.click();
}
function renderVaccines() {
    const body = document.getElementById('vaccineBody');
    const empty = document.getElementById('vaccineEmpty');
    body.innerHTML = '';

    if (vaccineRecords.length === 0) {
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    vaccineRecords.forEach((row, idx) => {
        const div = document.createElement('div');
        div.className = 'list-row';
        div.innerHTML = `
      <div class="list-col list-col--chevron"><i class="fa-solid fa-chevron-down"></i></div>
      <div class="list-col">${row.vaccineName || '—'}</div>
      <div class="list-col">${row.dateGiven || '—'}</div>
      <div class="list-col">${row.nextDueDate || '—'}</div>
      <div class="list-col">${row.doseType || '—'}</div>
      <div class="list-col">${row.status || '—'}</div>
      <div class="list-col">${row.loggedBy || '—'}</div>
      <div class="list-col list-col--actions">
        <button type="button" class="list-action-btn" data-idx="${idx}" data-action="attach-vaccine" title="Attachments"><i class="fa-solid fa-paperclip"></i></button>
        <button type="button" class="list-action-btn" data-idx="${idx}" data-action="edit-vaccine"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="list-action-btn" data-idx="${idx}" data-action="delete-vaccine"><i class="fa-solid fa-trash-can"></i></button>
      </div>`;
        body.appendChild(div);
    });
}

function renderMedications() {
    const body = document.getElementById('medicationBody');
    const empty = document.getElementById('medicationEmpty');
    body.innerHTML = '';

    if (medications.length === 0) {
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    medications.forEach((row, idx) => {
        const div = document.createElement('div');
        div.className = 'list-row';
        div.innerHTML = `
      <div class="list-col list-col--chevron"><i class="fa-solid fa-chevron-down"></i></div>
      <div class="list-col">${row.medicationName || '—'}</div>
      <div class="list-col">${row.dosage || '—'}</div>
      <div class="list-col">${row.frequency || '—'}</div>
      <div class="list-col">${row.status || '—'}</div>
      <div class="list-col">${row.nextOrderDate || '—'}</div>
      <div class="list-col">${row.dateStarted || '—'}</div>
      <div class="list-col">${row.loggedBy || '—'}</div>
      <div class="list-col list-col--actions">
        <button type="button" class="list-action-btn" data-idx="${idx}" data-action="edit-medication"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="list-action-btn" data-idx="${idx}" data-action="delete-medication"><i class="fa-solid fa-trash-can"></i></button>
      </div>`;
        body.appendChild(div);
    });
}

// Row action delegation
document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.idx);

    if (action === 'delete-coowner') { coOwners.splice(idx, 1); renderCoOwners(); }
    if (action === 'edit-coowner') { openOwnerModal('Associate', coOwners[idx]); }
    if (action === 'delete-vaccine') { vaccineRecords.splice(idx, 1); renderVaccines(); }
    if (action === 'edit-vaccine') { openVaccineModal(vaccineRecords[idx]); }
    if (action === 'attach-vaccine') { openVaccineAttachModal(vaccineRecords[idx]); }
    if (action === 'delete-medication') { medications.splice(idx, 1); renderMedications(); }
    if (action === 'edit-medication') { openMedicationModal(medications[idx]); }
});

document.getElementById('btnAddCoOwnerLink').addEventListener('click', (e) => { e.preventDefault(); openOwnerModal('Associate'); });
document.getElementById('btnAddVaccineLink').addEventListener('click', (e) => { e.preventDefault(); openVaccineModal(); });
document.getElementById('btnAddMedicationLink').addEventListener('click', (e) => { e.preventDefault(); openMedicationModal(); });
document.getElementById('btnTransferPet').addEventListener('click', () => openOwnerModal('Transfer'));

document.getElementById('btnEditCoOwners').addEventListener('click', () => document.getElementById('btnEditCoOwners').querySelector('i').classList.toggle('fa-xmark'));
document.getElementById('btnEditVaccines').addEventListener('click', () => document.getElementById('btnEditVaccines').querySelector('i').classList.toggle('fa-xmark'));
document.getElementById('btnEditMedications').addEventListener('click', () => document.getElementById('btnEditMedications').querySelector('i').classList.toggle('fa-xmark'));

// ============================================================
// OWNER / CO-OWNER MODAL  (Transfer + Associate + Invite)
// ============================================================
let ownerModalMode = null; // 'Transfer' | 'Associate'
let ownerModalSelected = null;
let ownerModalEditingRow = null;

function openOwnerModal(modalType, editingRow) {
    ownerModalMode = modalType;
    ownerModalEditingRow = editingRow || null;
    ownerModalSelected = null;

    document.getElementById('ownerModalOverlay').style.display = modalType === 'Transfer' ? 'flex' : 'none';
    document.getElementById('associateModalOverlay').style.display = modalType === 'Associate' ? 'flex' : 'none';

    if (modalType === 'Associate') {
        document.getElementById('associateModalTitle').textContent = editingRow ? 'Edit Co-owner' : 'Co-ownership';
    }

    ['ownerSearchInput', 'associateSearchInput'].forEach(id => document.getElementById(id).value = '');
    ['ownerSelectedName', 'ownerSelectedEmail', 'associateSelectedName', 'associateSelectedEmail'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('transferReason').value = '';
}

function closeOwnerModal() {
    document.getElementById('ownerModalOverlay').style.display = 'none';
    document.getElementById('associateModalOverlay').style.display = 'none';
}

document.getElementById('btnCloseOwnerModal').addEventListener('click', closeOwnerModal);
document.getElementById('btnCancelTransfer').addEventListener('click', closeOwnerModal);
document.getElementById('btnCloseAssociateModal').addEventListener('click', closeOwnerModal);
document.getElementById('btnCancelAssociate').addEventListener('click', closeOwnerModal);

function wireSearch(inputId, suggestionsId, nameId, emailId) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);

    input.addEventListener('input', () => renderSuggestions());
    input.addEventListener('focus', () => renderSuggestions());

    function renderSuggestions() {
        const q = input.value.trim().toLowerCase();
        if (!q) { suggestions.style.display = 'none'; return; }

        const matches = registeredUsers.filter(u =>
            (u.label || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.phone || '').toLowerCase().includes(q)
        );

        if (matches.length === 0) {
            suggestions.innerHTML = '<div class="no-user-found">No user found</div>';
            suggestions.style.display = 'block';
            return;
        }

        suggestions.innerHTML = matches.map((u, i) => `
      <div class="suggestion-item" data-match-idx="${i}">
        <div class="member-info">
          <span class="member-name">${u.label || u.email}</span>
          <span class="member-email">${u.email}</span>
        </div>
      </div>`).join('');
        suggestions.style.display = 'block';

        suggestions.querySelectorAll('[data-match-idx]').forEach(el => {
            el.addEventListener('click', () => {
                const u = matches[Number(el.dataset.matchIdx)];
                document.getElementById(nameId).value = u.label || '';
                document.getElementById(emailId).value = u.email || '';
                input.value = u.label || u.email;
                suggestions.style.display = 'none';
            });
        });
    }
}
wireSearch('ownerSearchInput', 'ownerSuggestions', 'ownerSelectedName', 'ownerSelectedEmail');
wireSearch('associateSearchInput', 'associateSuggestions', 'associateSelectedName', 'associateSelectedEmail');

document.getElementById('btnSubmitTransfer').addEventListener('click', async () => {
    const name = document.getElementById('ownerSelectedName').value;
    const email = document.getElementById('ownerSelectedEmail').value;
    const reason = document.getElementById('transferReason').value;

    let valid = true;
    document.getElementById('ownerSelectError').style.display = name ? 'none' : (valid = false, 'block');
    document.getElementById('ownerEmailError').style.display = email ? 'none' : (valid = false, 'block');
    document.getElementById('reasonError').style.display = reason ? 'none' : (valid = false, 'block');
    if (!valid) return;

    console.log('TODO: POST transfer request', { name, email, reason });
    closeOwnerModal();
});

document.getElementById('btnSubmitAssociate').addEventListener('click', () => {
    const name = document.getElementById('associateSelectedName').value;
    const email = document.getElementById('associateSelectedEmail').value;
    if (!email) return;

    const row = { name, email, phone: '', emergencyContact: '', emergencyPhone: '', isCoOwner: true, status: 'Pending' };
    if (ownerModalEditingRow) {
        Object.assign(ownerModalEditingRow, row);
    } else {
        coOwners.push(row);
    }
    renderCoOwners();
    closeOwnerModal();
});

// Invite modal (non-registered user)
function openInviteModal() {
    document.getElementById('inviteModalOverlay').style.display = 'flex';
    document.getElementById('inviteEmailInput').value = '';
    document.getElementById('inviteEmailError').style.display = 'none';
}
function closeInviteModal() {
    document.getElementById('inviteModalOverlay').style.display = 'none';
}
document.getElementById('btnInviteNonRegisteredTransfer').addEventListener('click', openInviteModal);
document.getElementById('btnInviteNonRegisteredAssociate').addEventListener('click', openInviteModal);
document.getElementById('btnCloseInviteModal').addEventListener('click', closeInviteModal);
document.getElementById('btnCancelInvite').addEventListener('click', closeInviteModal);
document.getElementById('btnSendInvite').addEventListener('click', () => {
    const email = document.getElementById('inviteEmailInput').value;
    if (!email) {
        document.getElementById('inviteEmailError').textContent = 'Email is required';
        document.getElementById('inviteEmailError').style.display = 'block';
        return;
    }
    console.log('TODO: POST invite for', email);
    closeInviteModal();
});

// ============================================================
// ADD / EDIT VACCINE RECORD MODAL
// ============================================================
let vaccineModalEditingRow = null;
let vaccineModalFiles = []; // [{ file, previewUrl, isPdf }]

function openVaccineModal(editingRow) {
    vaccineModalEditingRow = editingRow || null;
    vaccineModalFiles.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
    vaccineModalFiles = [];
    document.getElementById('vaccineModalOverlay').style.display = 'flex';

    document.getElementById('vaccineIsTiter').checked = false;
    document.getElementById('vaccineAdvancedToggle').checked = false;
    document.getElementById('vaccineName').value = '';
    document.getElementById('vaccineDoseType').value = '';
    document.getElementById('vaccineDateGiven').value = '';
    document.getElementById('vaccinePartOfSeries').checked = false;
    document.getElementById('vaccineNoFutureDoses').checked = false;
    document.getElementById('vaccineNextDueDate').value = '';
    document.getElementById('vaccineAdministeredBy').value = '';
    document.getElementById('vaccinePriceCurrency').value = 'USD';
    document.getElementById('vaccinePricePaid').value = '';
    document.getElementById('vaccineNotes').value = '';
    document.getElementById('vaccineFileError').style.display = 'none';
    renderVaccineModalFileList();

    if (editingRow) {
        document.getElementById('vaccineName').value = editingRow.vaccineName || '';
        document.getElementById('vaccineDoseType').value = editingRow.doseType || '';
        document.getElementById('vaccineDateGiven').value = editingRow.dateGivenRaw || '';
        document.getElementById('vaccineNextDueDate').value = editingRow.nextDueDateRaw || '';
        document.getElementById('vaccineAdministeredBy').value = editingRow.administeredBy || '';
        document.getElementById('vaccinePricePaid').value = editingRow.pricePaid || '';
        document.getElementById('vaccineNotes').value = editingRow.notes || '';
    }
}

function closeVaccineModal() {
    document.getElementById('vaccineModalOverlay').style.display = 'none';
}

document.getElementById('btnCloseVaccineModal').addEventListener('click', closeVaccineModal);
document.getElementById('btnCancelVaccine').addEventListener('click', closeVaccineModal);

document.getElementById('vaccineNoFutureDoses').addEventListener('change', (e) => {
    document.getElementById('vaccineNextDueWrapper').style.display = e.target.checked ? 'none' : 'block';
});

// ---- Vaccine modal file upload (Choose Files) ----
document.getElementById('btnVaccineChooseFiles').addEventListener('click', () => {
    document.getElementById('vaccineFileInput').click();
});

document.getElementById('vaccineFileInput').addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(handleVaccineModalFile);
    e.target.value = '';
});

function handleVaccineModalFile(file) {
    const errorEl = document.getElementById('vaccineFileError');
    errorEl.style.display = 'none';

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'pdf'];
    if (!allowed.includes(ext)) {
        errorEl.textContent = `"${file.name}" isn't a supported file type. Please use .jpeg, .png, or .pdf.`;
        errorEl.style.display = 'block';
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        errorEl.textContent = `"${file.name}" is larger than 10MB. Please choose a smaller file.`;
        errorEl.style.display = 'block';
        return;
    }

    const entry = { file, isPdf: ext === 'pdf', previewUrl: ext !== 'pdf' ? URL.createObjectURL(file) : null };
    vaccineModalFiles.push(entry);
    renderVaccineModalFileList();
}

function renderVaccineModalFileList() {
    const dropArea = document.getElementById('vaccineFileDropArea');
    const dropText = document.getElementById('vaccineFileDropText');
    const list = document.getElementById('vaccineFileList');
    list.innerHTML = '';

    dropText.textContent = vaccineModalFiles.length === 0 ? 'No files selected' : `${vaccineModalFiles.length} file(s) selected`;

    vaccineModalFiles.forEach((entry, idx) => {
        const row = document.createElement('div');
        row.className = 'uploaded-file';
        if (entry.previewUrl) {
            row.innerHTML = `<img class="file-thumb" src="${entry.previewUrl}" alt="" />`;
        } else {
            row.innerHTML = `<i class="fa-solid fa-file-pdf file-icon"></i>`;
        }
        row.innerHTML += `
      <span class="file-name" title="${entry.file.name}">${entry.file.name}</span>
      <button type="button" class="file-remove-btn" data-vaccine-file-remove="${idx}">×</button>`;
        row.querySelector('[data-vaccine-file-remove]').addEventListener('click', () => {
            const removed = vaccineModalFiles.splice(idx, 1)[0];
            if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
            renderVaccineModalFileList();
        });
        list.appendChild(row);
    });
}

document.getElementById('btnSaveVaccine').addEventListener('click', () => {
    const row = {
        vaccineName: document.getElementById('vaccineName').value,
        dateGiven: document.getElementById('vaccineDateGiven').value,
        dateGivenRaw: document.getElementById('vaccineDateGiven').value,
        nextDueDate: document.getElementById('vaccineNextDueDate').value,
        nextDueDateRaw: document.getElementById('vaccineNextDueDate').value,
        doseType: document.getElementById('vaccineDoseType').value,
        administeredBy: document.getElementById('vaccineAdministeredBy').value,
        priceCurrency: document.getElementById('vaccinePriceCurrency').value,
        pricePaid: document.getElementById('vaccinePricePaid').value,
        notes: document.getElementById('vaccineNotes').value,
        status: 'Active',
        loggedBy: 'You',
    };

    // TODO: upload vaccineModalFiles[].file to your API alongside the record, e.g.:
    // const formData = new FormData();
    // vaccineModalFiles.forEach(f => formData.append('files', f.file));
    // Object.entries(row).forEach(([k, v]) => formData.append(k, v));
    // await fetch('/api/pet-vaccine', { method: 'POST', body: formData });

    if (vaccineModalEditingRow) {
        Object.assign(vaccineModalEditingRow, row);
    } else {
        vaccineRecords.push(row);
    }
    renderVaccines();
    closeVaccineModal();
});

// ============================================================
// ADD / EDIT MEDICATION RECORD MODAL
// ============================================================
let medicationModalEditingRow = null;

function openMedicationModal(editingRow) {
    medicationModalEditingRow = editingRow || null;
    document.getElementById('medicationModalOverlay').style.display = 'flex';

    document.getElementById('medicationIsOngoing').checked = false;
    document.getElementById('medicationAdvancedToggle').checked = false;
    document.getElementById('medicationTrackSupply').checked = false;
    document.getElementById('medicationSupplyWrapper').style.display = 'none';
    document.getElementById('medicationCurrentSupply').value = '';

    document.getElementById('medicationName').value = '';
    document.getElementById('medicationDateStarted').value = '';
    document.getElementById('medicationDosageAmount').value = '';
    document.getElementById('medicationNeverEnds').checked = false;
    document.getElementById('medicationEndDate').disabled = false;
    document.getElementById('medicationEndDate').value = '';
    document.getElementById('medicationFrequencyUnit').value = '';
    document.getElementById('medicationPrescribedBy').value = '';
    document.getElementById('medicationAdminMethod').value = '';
    document.getElementById('medicationPriceCurrency').value = 'USD';
    document.getElementById('medicationPricePaid').value = '';
    document.getElementById('medicationAdminConditions').value = '';
    document.getElementById('medicationReason').value = '';

    if (editingRow) {
        document.getElementById('medicationName').value = editingRow.medicationName || '';
        document.getElementById('medicationDosageAmount').value = editingRow.dosage || '';
        document.getElementById('medicationDateStarted').value = editingRow.dateStartedRaw || '';
        document.getElementById('medicationEndDate').value = editingRow.endDateRaw || '';
        document.getElementById('medicationPrescribedBy').value = editingRow.prescribedBy || '';
        document.getElementById('medicationPricePaid').value = editingRow.pricePaid || '';
        document.getElementById('medicationReason').value = editingRow.reason || '';
    }
}

function closeMedicationModal() {
    document.getElementById('medicationModalOverlay').style.display = 'none';
}

document.getElementById('btnCloseMedicationModal').addEventListener('click', closeMedicationModal);
document.getElementById('btnCancelMedication').addEventListener('click', closeMedicationModal);

document.getElementById('medicationNeverEnds').addEventListener('change', (e) => {
    const endDateInput = document.getElementById('medicationEndDate');
    endDateInput.disabled = e.target.checked;
    if (e.target.checked) endDateInput.value = '';
});

document.getElementById('medicationTrackSupply').addEventListener('change', (e) => {
    document.getElementById('medicationSupplyWrapper').style.display = e.target.checked ? 'block' : 'none';
});

document.getElementById('medicationIsOngoing').addEventListener('change', (e) => {
    const isOngoing = e.target.checked;
    const neverEndsCheckbox = document.getElementById('medicationNeverEnds');
    const endDateInput = document.getElementById('medicationEndDate');
    if (isOngoing) {
        neverEndsCheckbox.checked = true;
        endDateInput.disabled = true;
        endDateInput.value = '';
    }
});

document.getElementById('btnSaveMedication').addEventListener('click', () => {
    const frequencySelect = document.getElementById('medicationFrequencyUnit');
    const methodSelect = document.getElementById('medicationAdminMethod');
    const conditionsSelect = document.getElementById('medicationAdminConditions');

    const row = {
        medicationName: document.getElementById('medicationName').value,
        dosage: document.getElementById('medicationDosageAmount').value,
        frequency: frequencySelect.options[frequencySelect.selectedIndex]?.text || '',
        status: document.getElementById('medicationIsOngoing').checked ? 'Ongoing' : 'Active',
        dateStarted: document.getElementById('medicationDateStarted').value,
        dateStartedRaw: document.getElementById('medicationDateStarted').value,
        endDate: document.getElementById('medicationEndDate').value,
        endDateRaw: document.getElementById('medicationEndDate').value,
        neverEnds: document.getElementById('medicationNeverEnds').checked,
        prescribedBy: document.getElementById('medicationPrescribedBy').value,
        adminMethod: methodSelect.options[methodSelect.selectedIndex]?.text || '',
        adminConditions: conditionsSelect.options[conditionsSelect.selectedIndex]?.text || '',
        priceCurrency: document.getElementById('medicationPriceCurrency').value,
        pricePaid: document.getElementById('medicationPricePaid').value,
        reason: document.getElementById('medicationReason').value,
        trackSupply: document.getElementById('medicationTrackSupply').checked,
        currentSupply: document.getElementById('medicationCurrentSupply').value,
        nextOrderDate: '', // TODO: compute from currentSupply/frequency if trackSupply is on
        loggedBy: 'You',
    };

    // TODO: POST this record to your API, e.g.:
    // await fetch('/api/pet-medication', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(row) });

    if (medicationModalEditingRow) {
        Object.assign(medicationModalEditingRow, row);
    } else {
        medications.push(row);
    }
    renderMedications();
    closeMedicationModal();
});

// ============================================================
// DOCUMENT PREVIEW MODAL  (ported from PetDocumentPreviewModalComponent)
// ============================================================
function getExtension(fileName, url) {
    const fromName = (fileName || '').split('?')[0].split('#')[0];
    const nameExt = fromName.includes('.') ? fromName.split('.').pop() : '';
    if (nameExt) return String(nameExt).trim().toLowerCase();
    const fromUrl = (url || '').split('?')[0].split('#')[0];
    const urlExt = fromUrl.includes('.') ? fromUrl.split('.').pop() : '';
    return urlExt ? String(urlExt).trim().toLowerCase() : '';
}
const isImageExt = (ext) => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
const isTextExt = (ext) => ['txt', 'log', 'csv', 'json', 'xml', 'md', 'yaml', 'yml'].includes(ext);
const isOfficeExt = (ext) => ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf', 'odt', 'ods', 'odp'].includes(ext);
const getOfficeViewerUrl = (url) => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
const getGoogleViewerUrl = (url) => `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;

let docPreviewCurrentFileUrl = '';
let docPreviewCurrentFileName = '';

async function openDocPreviewModal(fileName, fileUrl) {
    docPreviewCurrentFileName = fileName || 'Document';
    docPreviewCurrentFileUrl = fileUrl || '';
    document.getElementById('docPreviewFileName').textContent = docPreviewCurrentFileName;
    document.getElementById('docPreviewOverlay').style.display = 'flex';

    const body = document.getElementById('docPreviewBody');

    if (!docPreviewCurrentFileUrl) {
        body.innerHTML = `<div class="pet-doc-preview__fallback">No file URL was provided for this document.</div>`;
        return;
    }

    const ext = getExtension(docPreviewCurrentFileName, docPreviewCurrentFileUrl);

    if (isImageExt(ext)) {
        body.innerHTML = `<img class="pet-doc-preview__image" src="${docPreviewCurrentFileUrl}" alt="${docPreviewCurrentFileName}" />`;
        return;
    }
    if (ext === 'pdf') {
        body.innerHTML = `<iframe class="pet-doc-preview__frame" src="${docPreviewCurrentFileUrl}" title="PDF preview"></iframe>`;
        return;
    }
    if (isTextExt(ext)) {
        body.innerHTML = `<div class="pet-doc-preview__fallback">Loading preview…</div>`;
        try {
            const res = await fetch(docPreviewCurrentFileUrl);
            if (!res.ok) throw new Error('bad response');
            let text = await res.text();
            const maxChars = 200000;
            if (text.length > maxChars) text = text.slice(0, maxChars) + '\n\n…(truncated)…';
            body.innerHTML = `<div class="pet-doc-preview__text"><pre>${text.replace(/</g, '&lt;')}</pre></div>`;
        } catch {
            body.innerHTML = `<div class="pet-doc-preview__fallback">Could not load a text preview for this file.<div class="pet-doc-preview__hint">Use Download to open it in its native app.</div></div>`;
        }
        return;
    }
    if (isOfficeExt(ext)) {
        renderOfficeViewer(getOfficeViewerUrl(docPreviewCurrentFileUrl));
        return;
    }

    body.innerHTML = `<div class="pet-doc-preview__fallback">Preview is not available for this file type.<div class="pet-doc-preview__hint">Use Download to open it in its native app.</div></div>`;
}

function renderOfficeViewer(viewerUrl) {
    const body = document.getElementById('docPreviewBody');
    body.innerHTML = `
    <iframe class="pet-doc-preview__frame" src="${viewerUrl}" title="Office preview"></iframe>
    <div class="pet-doc-preview__hint">
      If preview does not load, the file link may require sign-in. Use Download instead.
      <div style="margin-top:6px;">
        <button type="button" class="cancel-button" id="btnUseOfficeViewer" style="margin-right:8px;">Office viewer</button>
        <button type="button" class="cancel-button" id="btnUseGoogleViewer">Google viewer</button>
      </div>
    </div>`;
    document.getElementById('btnUseOfficeViewer').addEventListener('click', () => renderOfficeViewer(getOfficeViewerUrl(docPreviewCurrentFileUrl)));
    document.getElementById('btnUseGoogleViewer').addEventListener('click', () => renderOfficeViewer(getGoogleViewerUrl(docPreviewCurrentFileUrl)));
}

function closeDocPreviewModal() {
    document.getElementById('docPreviewOverlay').style.display = 'none';
    document.getElementById('docPreviewBody').innerHTML = '';
}

document.getElementById('btnCloseDocPreview').addEventListener('click', closeDocPreviewModal);
document.getElementById('btnDocPreviewDownload').addEventListener('click', () => {
    if (!docPreviewCurrentFileUrl) return;
    const link = document.createElement('a');
    link.href = docPreviewCurrentFileUrl;
    link.download = docPreviewCurrentFileName || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// ============================================================
// DOCUMENT TAG MODAL (link file to incident / vaccine / medication)
// ============================================================
// Populate these from your API for the current pet (petService.getPet, petVaccineService.getPetVaccineTable)
let docTagIncidentRows = [];
let docTagMedicationRows = [];
let docTagVaccineRows = [];
let docTagSelectedRow = null;
let docTagFileNameCurrent = '';
let docTagAttachmentIdCurrent = null;

function openDocTagModal(fileName, attachmentId) {
    docTagFileNameCurrent = fileName;
    docTagAttachmentIdCurrent = attachmentId;
    docTagSelectedRow = null;
    document.getElementById('docTagFileName').textContent = fileName;
    document.getElementById('docTagRecordType').value = '';
    document.getElementById('docTagTableWrap').innerHTML = '';
    document.getElementById('docTagEmptyMsg').style.display = 'none';
    document.getElementById('btnLinkDocTag').disabled = true;
    document.getElementById('docTagOverlay').style.display = 'flex';
}

function closeDocTagModal() {
    document.getElementById('docTagOverlay').style.display = 'none';
}

document.getElementById('btnCloseDocTag').addEventListener('click', closeDocTagModal);
document.getElementById('btnCancelDocTag').addEventListener('click', closeDocTagModal);

document.getElementById('docTagRecordType').addEventListener('change', (e) => {
    docTagSelectedRow = null;
    document.getElementById('btnLinkDocTag').disabled = true;
    renderDocTagTable(e.target.value);
});

function renderDocTagTable(recordType) {
    const wrap = document.getElementById('docTagTableWrap');
    const emptyMsg = document.getElementById('docTagEmptyMsg');
    wrap.innerHTML = '';

    const rowsMap = { incident: docTagIncidentRows, vaccine: docTagVaccineRows, medication: docTagMedicationRows };
    const rows = rowsMap[recordType] || [];

    if (!recordType || rows.length === 0) {
        emptyMsg.style.display = recordType ? 'block' : 'none';
        return;
    }
    emptyMsg.style.display = 'none';

    const colsMap = {
        incident: [['reportName', 'Report'], ['incidentTypeDesc', 'Event type'], ['dateStart', 'Start date']],
        medication: [['medicationName', 'Medication'], ['dateStart', 'Start date'], ['status', 'Status']],
        vaccine: [['vaccineName', 'Vaccine'], ['dateStart', 'Date given'], ['dosageName', 'Dose type']],
    };
    const cols = colsMap[recordType];

    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `<thead><tr><th></th>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr></thead>`;
    const tbody = document.createElement('tbody');

    rows.forEach((row) => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.innerHTML = `<td><input type="radio" name="docTagRow" /></td>` +
            cols.map(c => `<td>${row[c[0]] || '—'}</td>`).join('');
        tr.addEventListener('click', () => {
            docTagSelectedRow = row;
            tbody.querySelectorAll('input[type=radio]').forEach(r => r.checked = false);
            tr.querySelector('input[type=radio]').checked = true;
            document.getElementById('btnLinkDocTag').disabled = false;
        });
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrap.appendChild(table);
}

document.getElementById('btnLinkDocTag').addEventListener('click', () => {
    if (!docTagSelectedRow) return;
    const recordType = document.getElementById('docTagRecordType').value;
    console.log('TODO: POST link document', {
        attachmentId: docTagAttachmentIdCurrent,
        tagType: recordType,
        row: docTagSelectedRow,
        fileName: docTagFileNameCurrent,
    });
    closeDocTagModal();
});

// ============================================================
// TAGGED / LINKED DOCUMENTS MODAL
// ============================================================
function openTaggedDocsModal(titleSuffix, rows) {
    document.getElementById('taggedDocsOverlay').style.display = 'flex';
    const intro = document.getElementById('taggedDocsIntro');
    if (titleSuffix) {
        intro.style.display = 'block';
        document.getElementById('taggedDocsTitleSuffix').textContent = titleSuffix;
    } else {
        intro.style.display = 'none';
    }
    renderTaggedDocsList(rows || []);
}

function renderTaggedDocsList(rows) {
    const list = document.getElementById('taggedDocsList');
    const empty = document.getElementById('taggedDocsEmpty');
    list.innerHTML = '';

    if (rows.length === 0) {
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    rows.forEach((row) => {
        const div = document.createElement('div');
        div.className = 'doc-list-row';
        const actionLabel = row.__source === 'attachment' ? 'Delete file' : 'Remove link';
        div.innerHTML = `
      <button class="doc-list-link" title="${row.fileName}">${row.fileName}</button>
      <button class="doc-list-action-btn" data-action="${row.__source === 'attachment' ? 'deleteAttachment' : 'untag'}">${actionLabel}</button>`;

        div.querySelector('.doc-list-link').addEventListener('click', () => openDocPreviewModal(row.fileName, row.fileUrl));
        div.querySelector('.doc-list-action-btn').addEventListener('click', () => {
            console.log('TODO: call API for action', div.querySelector('[data-action]').dataset.action, row);
        });
        list.appendChild(div);
    });
}

function closeTaggedDocsModal() {
    document.getElementById('taggedDocsOverlay').style.display = 'none';
}
document.getElementById('btnCloseTaggedDocs').addEventListener('click', closeTaggedDocsModal);
document.getElementById('btnCloseTaggedDocsFooter').addEventListener('click', closeTaggedDocsModal);

// ============================================================
// VACCINE ATTACHMENTS (uploaded files) MODAL
// ============================================================
function openVaccineAttachModal(vaccineRow) {
    document.getElementById('vaccineAttachOverlay').style.display = 'flex';
    const titleSuffix = document.getElementById('vaccineAttachTitleSuffix');
    if (vaccineRow?.vaccineName) {
        titleSuffix.style.display = 'block';
        titleSuffix.innerHTML = `RECORD <strong>${vaccineRow.vaccineName}</strong>`;
    } else {
        titleSuffix.style.display = 'none';
    }
    // TODO: fetch real attachments via petVaccineService.getVaccineAttachments(petVaccineId)
    renderVaccineAttachList([]);
}

function renderVaccineAttachList(rows) {
    const list = document.getElementById('vaccineAttachList');
    const empty = document.getElementById('vaccineAttachEmpty');
    list.innerHTML = '';

    if (rows.length === 0) {
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    rows.forEach((row) => {
        const div = document.createElement('div');
        div.className = 'doc-list-row';
        div.innerHTML = `<button class="doc-list-link" title="${row.fileName}">${row.fileName}</button><span style="color:#6b7280; font-size:0.8rem;">${row.fileType || ''}</span>`;
        div.querySelector('.doc-list-link').addEventListener('click', () => openDocPreviewModal(row.fileName, row.fileUrl));
        list.appendChild(div);
    });
}

function closeVaccineAttachModal() {
    document.getElementById('vaccineAttachOverlay').style.display = 'none';
}
document.getElementById('btnCloseVaccineAttach').addEventListener('click', closeVaccineAttachModal);
document.getElementById('btnCloseVaccineAttachFooter').addEventListener('click', closeVaccineAttachModal);

// ============================================================
// QUICK CAPTURE MODAL (camera icon → photo/PDF upload, iPhone HEIC-aware)
// ============================================================
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB, matches the accepted-files hint
const ACCEPTED_UPLOAD_EXT = ['jpg', 'jpeg', 'png', 'pdf', 'heic', 'heif'];

let quickCaptureContext = null; // 'vaccine' | 'medication'
let quickCaptureFiles = []; // [{ file, previewUrl, displayName }]

function openQuickCaptureModal(context) {
    quickCaptureContext = context;
    quickCaptureFiles = [];
    document.getElementById('quickCaptureTitle').textContent =
        context === 'medication' ? 'Add Medication Record' : 'Add Vaccine Record';
    document.getElementById('quickCapturePrice').value = '';
    document.getElementById('quickCaptureCurrency').value = 'USD';
    document.getElementById('quickCaptureFileError').style.display = 'none';
    setQuickCaptureBusy(false);
    renderQuickCaptureFileList();
    document.getElementById('quickCaptureOverlay').style.display = 'flex';
}

function closeQuickCaptureModal() {
    document.getElementById('quickCaptureOverlay').style.display = 'none';
    // Release object URLs to avoid memory leaks
    quickCaptureFiles.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
    quickCaptureFiles = [];
}

document.getElementById('btnCameraVaccine').addEventListener('click', () => openQuickCaptureModal('vaccine'));
document.getElementById('btnCameraMedication').addEventListener('click', () => openQuickCaptureModal('medication'));
document.getElementById('btnCloseQuickCapture').addEventListener('click', closeQuickCaptureModal);
document.getElementById('btnCancelQuickCapture').addEventListener('click', closeQuickCaptureModal);

document.getElementById('btnQuickCaptureChooseFiles').addEventListener('click', () => {
    const input = quickCaptureContext === 'medication'
        ? document.getElementById('medicationCameraInput')
        : document.getElementById('vaccineCameraInput');
    input.click();
});

function getFileExtension(fileName) {
    const parts = (fileName || '').split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function isHeicFile(file) {
    const ext = getFileExtension(file.name);
    return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';
}

async function handleQuickCaptureFile(file) {
    const errorEl = document.getElementById('quickCaptureFileError');
    errorEl.style.display = 'none';

    const ext = getFileExtension(file.name);
    if (!ACCEPTED_UPLOAD_EXT.includes(ext)) {
        errorEl.textContent = `"${file.name}" isn't a supported file type. Please use .jpeg, .png, .pdf, .heic, or .heif.`;
        errorEl.style.display = 'block';
        return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
        errorEl.textContent = `"${file.name}" is larger than 10MB. Please choose a smaller file.`;
        errorEl.style.display = 'block';
        return;
    }

    const entry = { file, previewUrl: null, displayName: file.name, isPdf: ext === 'pdf' };

    if (isHeicFile(file)) {
        // iPhone photos are often saved as HEIC/HEIF, which most non-Safari browsers can't
        // render directly. Convert to a JPEG blob client-side just for the preview thumbnail;
        // the original HEIC file is still what gets uploaded/stored.
        if (typeof heic2any === 'function') {
            try {
                const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
                entry.previewUrl = URL.createObjectURL(convertedBlob);
            } catch (err) {
                console.warn('HEIC conversion failed, falling back to generic file icon:', err);
                entry.previewUrl = null;
            }
        } else {
            console.warn('heic2any library not loaded; showing generic icon for HEIC file.');
        }
    } else if (!entry.isPdf) {
        entry.previewUrl = URL.createObjectURL(file);
    }

    quickCaptureFiles.push(entry);
    renderQuickCaptureFileList();
}

function renderQuickCaptureFileList() {
    const list = document.getElementById('quickCaptureFileList');
    list.innerHTML = '';

    quickCaptureFiles.forEach((entry, idx) => {
        const row = document.createElement('div');
        row.className = 'uploaded-file';

        if (entry.previewUrl) {
            row.innerHTML = `<img class="file-thumb" src="${entry.previewUrl}" alt="" />`;
        } else {
            const iconClass = entry.isPdf ? 'fa-file-pdf' : 'fa-file-image';
            row.innerHTML = `<i class="fa-solid ${iconClass} file-icon"></i>`;
        }

        row.innerHTML += `
      <span class="file-name" title="${entry.displayName}">${entry.displayName}</span>
      <button type="button" class="file-remove-btn" data-remove-idx="${idx}">×</button>`;

        row.querySelector('[data-remove-idx]').addEventListener('click', () => {
            const removed = quickCaptureFiles.splice(idx, 1)[0];
            if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
            renderQuickCaptureFileList();
        });

        list.appendChild(row);
    });
}

document.getElementById('vaccineCameraInput').addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(handleQuickCaptureFile);
    e.target.value = ''; // allow re-selecting the same file later
});
document.getElementById('medicationCameraInput').addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(handleQuickCaptureFile);
    e.target.value = '';
});

async function submitQuickCapture(files, price, currency, context) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f.file));
    formData.append('price', price);
    formData.append('currency', currency);
    formData.append('context', context);

    const res = await fetch('/submit', { method: 'POST', body: formData });

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        const detail = body?.detail || body?.title || `status ${res.status}`;
        throw new Error(`Upload failed: ${detail}`);
    }

    return res.json();
}
function stripLeadingOcrJunk(text) {
    // Drops leftover "--"-style bullets/dashes where a date used to sit
    // (an artifact of the history-line date-stripping in the extractor).
    return (text || '').replace(/^[\s\-\u2013\u2014]+/, '');
}

function cleanVaccineName(text) {
    let cleaned = stripLeadingOcrJunk(text)
        .replace(/\b\d+\s*-?\s*years?\b/gi, ' ')
        .replace(/\byears?\b/gi, ' ')
        .replace(/\boral\b/gi, ' ');

    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

    return cleaned;
}

function cleanMedicationName(text) {
    // Trailing weight-unit fragments (e.g. "-Ibs") bleed in from the
    // receipt's Weight column merging with the item row; "Ibs" is a
    // common OCR misread of "lbs" (capital I / lowercase l confusion).
    let cleaned = stripLeadingOcrJunk(text);
    cleaned = cleaned.replace(/[\s\-]+(?:lbs?|kg|oz|ibs)\.?\s*$/i, '');
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

    return cleaned;
}

function buildVaccineRowFromOcr(record, visitDate, doctor) {
    const resolvedDate = record.date || visitDate;

    return {
        vaccineName: cleanVaccineName(record.description),
        dateGiven: convertOcrDateToInputValue(resolvedDate),
        dateGivenRaw: convertOcrDateToInputValue(resolvedDate),
        nextDueDate: '',
        nextDueDateRaw: '',
        doseType: matchDoseTypeId(record.description),
        administeredBy: doctor || '',
        priceCurrency: 'USD',
        pricePaid: record.price ?? '',
        notes: record.description || '',
        status: 'Active',
        loggedBy: 'OCR Import',
    };
}

function ingestOcrVaccines(ocrVaccines, visitDate, doctor) {
    (ocrVaccines || []).forEach(record => {
        vaccineRecords.push(buildVaccineRowFromOcr(record, visitDate, doctor));
    });
    renderVaccines();
}

function buildOcrReasonContext(hospital, otherItems) {
    const parts = [];

    if (hospital) {
        parts.push(`Visit at ${hospital}`);
    }

    const extras = (otherItems || [])
        .map(item => item.description)
        .filter(Boolean)
        .join(', ');

    if (extras) {
        parts.push(`Other charges on receipt: ${extras}`);
    }

    return parts.join('. ');
}

function buildMedicationRowFromOcr(record, visitDate, doctor, reasonContext) {
    return {
        medicationName: cleanMedicationName(record.description),
        dosage: '',
        frequency: '',
        status: 'Active',
        dateStarted: convertOcrDateToInputValue(visitDate),
        dateStartedRaw: convertOcrDateToInputValue(visitDate),
        endDate: '',
        endDateRaw: '',
        neverEnds: false,
        prescribedBy: doctor || '',
        adminMethod: '',
        adminConditions: '',
        priceCurrency: 'USD',
        pricePaid: record.price ?? '',
        reason: reasonContext || '',
        trackSupply: false,
        currentSupply: '',
        nextOrderDate: '',
        loggedBy: 'OCR Import',
    };
}

function ingestOcrMedications(ocrMedications, visitDate, doctor, reasonContext) {
    (ocrMedications || []).forEach(record => {
        medications.push(buildMedicationRowFromOcr(record, visitDate, doctor, reasonContext));
    });
    renderMedications();
}

function setQuickCaptureBusy(isBusy) {
    document.getElementById('quickCaptureProgress').style.display = isBusy ? 'block' : 'none';
    document.getElementById('btnSaveQuickCapture').disabled = isBusy;
    document.getElementById('btnCancelQuickCapture').disabled = isBusy;
}

document.getElementById('btnSaveQuickCapture').addEventListener('click', async () => {
    const price = document.getElementById('quickCapturePrice').value;
    const currency = document.getElementById('quickCaptureCurrency').value;

    let data;
    setQuickCaptureBusy(true);
    try {
        data = await submitQuickCapture(quickCaptureFiles, price, currency, quickCaptureContext);
        console.log('Quick capture uploaded:', data);
    } catch (err) {
        console.error('Quick capture upload failed:', err);
        alert('Upload failed. Please try again.');
        return;
    } finally {
        setQuickCaptureBusy(false);
    }

    // payloadHandler.cs wraps Controller.py's full output object under its own
    // "ocr" key, and Controller.py's own output already has an "ocr" key inside
    // it for the actual extraction results -- so the real data sits at
    // data.ocr.ocr, not data.ocr.
    const extraction = data.ocr.ocr;
    const reasonContext = buildOcrReasonContext(extraction.hospital, extraction.other_items);
    ingestOcrVaccines(extraction.vaccines, extraction.date, extraction.doctor);
    ingestOcrMedications(extraction.medications, extraction.date, extraction.doctor, reasonContext);
    closeQuickCaptureModal();
});
function convertOcrDateToInputValue(ocrDate) {
    const match = (ocrDate || '').match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (!match) return '';
    let [, month, day, year] = match;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function matchVaccineOptionId(ocrName) {
    const lower = (ocrName || '').toLowerCase();
    if (lower.includes('dhpp') || lower.includes('dhp/p') || lower.includes('dapp')) return 'distemper';
    if (lower.includes('kennel cough')) return 'bordetella';
    if (lower.includes('feline leukemia')) return 'felv';
    const found = vaccineOptions.find(opt => opt.id !== 'other' && lower.includes(opt.id));
    return found ? found.id : 'other';
}

function matchDoseTypeId(ocrName) {
    const lower = (ocrName || '').toLowerCase();
    if (lower.includes('titer')) return 'titer';
    if (lower.includes('booster')) return 'booster';
    if (/\b3\s*-?\s*year\b/.test(lower)) return '3yr';
    if (/\b1\s*-?\s*year\b/.test(lower)) return '1yr';
    return '';
}

// ---- Init ----
populateAllDropdowns();
setMode('add');
renderCoOwners();
renderVaccines();
renderMedications();