document.addEventListener('DOMContentLoaded', function() {
    var loginScreen = document.getElementById('loginScreen');
    var loginForm = document.getElementById('loginForm');
    var dashboard = document.getElementById('dashboard');
    var logoutBtn = document.getElementById('logoutBtn');
    var dashCards = document.getElementById('dashCards');
    var tableBody = document.getElementById('tableBody');
    var pagination = document.getElementById('pagination');
    var searchInput = document.getElementById('searchInput');
    var filterType = document.getElementById('filterType');
    var filterFrom = document.getElementById('filterFrom');
    var filterTo = document.getElementById('filterTo');
    var viewTable = document.getElementById('viewTable');
    var viewCalendar = document.getElementById('viewCalendar');
    var tableView = document.getElementById('tableView');
    var calendarView = document.getElementById('calendarView');
    var detailPanel = document.getElementById('detailPanel');
    var panelOverlay = document.getElementById('panelOverlay');
    var panelClose = document.getElementById('panelClose');
    var panelTitle = document.getElementById('panelTitle');
    var panelSubtitle = document.getElementById('panelSubtitle');
    var panelBody = document.getElementById('panelBody');
    var activeBooking = null;
    var cardsList = document.getElementById('cardsList');
    var filtersToggle = document.getElementById('filtersToggle');
    var filterStatus = document.getElementById('filterStatus');

    var bookings = [];
    var currentPage = 1;
    var perPage = 25;
    var sortField = 'bookingDate';
    var sortDir = 'desc';
    var todayStr = new Date().toISOString().split('T')[0];

    // --- LOGIN ---
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        initDashboard();
    });

    logoutBtn.addEventListener('click', function() {
        dashboard.style.display = 'none';
        loginScreen.style.display = '';
    });

    // --- INIT ---
    function initDashboard() {
        if (!window.BOOKINGS_DATA) return;

        bookings = [];
        var datePattern = /^\d{4}-\d{2}-\d{2}$/;

        // Seeded random for consistent demo data
        function seededRandom(seed) {
            var x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        }

        // Workflow statuses: Provisional → Accepted → Confirmed → Paid (or Rejected / Overdue)
        // Checklist items per booking: Accept booking, Sign documents, Pay deposit, Pay final balance
        function assignWorkflowStatus(booking, index) {
            var validDate = datePattern.test(booking.bookingDate);
            var isFuture = validDate && booking.bookingDate >= todayStr;
            var isPast = validDate && booking.bookingDate < todayStr;
            var rand = seededRandom(index + 1);
            var status, checklist;

            if (isPast) {
                // 80% Paid, 15% Rejected, 5% Overdue
                if (rand < 0.80) {
                    status = 'Paid';
                    checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: true };
                } else if (rand < 0.95) {
                    status = 'Rejected';
                    checklist = { accepted: false, docsSigned: false, depositPaid: false, finalPaid: false };
                } else {
                    status = 'Overdue';
                    // They came, used the hall, but never fully paid
                    var r2 = seededRandom(index + 100);
                    if (r2 < 0.4) {
                        checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: false };
                    } else if (r2 < 0.7) {
                        checklist = { accepted: true, docsSigned: true, depositPaid: false, finalPaid: false };
                    } else {
                        checklist = { accepted: true, docsSigned: false, depositPaid: false, finalPaid: false };
                    }
                }
            } else if (isFuture) {
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                var eventDate = new Date(booking.bookingDate + 'T00:00:00');
                var daysAway = Math.round((eventDate - today) / (1000 * 60 * 60 * 24));

                if (daysAway <= 3) {
                    if (rand < 0.2) {
                        status = 'Confirmed'; checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: false };
                    } else {
                        status = 'Paid'; checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: true };
                    }
                } else if (daysAway <= 14) {
                    if (rand < 0.10) {
                        status = 'Provisional'; checklist = { accepted: false, docsSigned: false, depositPaid: false, finalPaid: false };
                    } else if (rand < 0.30) {
                        status = 'Accepted'; checklist = { accepted: true, docsSigned: false, depositPaid: false, finalPaid: false };
                    } else if (rand < 0.65) {
                        status = 'Confirmed'; checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: false };
                    } else {
                        status = 'Paid'; checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: true };
                    }
                } else if (daysAway <= 60) {
                    if (rand < 0.25) {
                        status = 'Provisional'; checklist = { accepted: false, docsSigned: false, depositPaid: false, finalPaid: false };
                    } else if (rand < 0.50) {
                        status = 'Accepted'; checklist = { accepted: true, docsSigned: false, depositPaid: false, finalPaid: false };
                    } else if (rand < 0.80) {
                        status = 'Confirmed'; checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: false };
                    } else {
                        status = 'Paid'; checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: true };
                    }
                } else {
                    if (rand < 0.45) {
                        status = 'Provisional'; checklist = { accepted: false, docsSigned: false, depositPaid: false, finalPaid: false };
                    } else if (rand < 0.75) {
                        status = 'Accepted'; checklist = { accepted: true, docsSigned: false, depositPaid: false, finalPaid: false };
                    } else if (rand < 0.90) {
                        // Some accepted have started docs
                        var r2 = seededRandom(index + 200);
                        if (r2 < 0.5) {
                            status = 'Accepted'; checklist = { accepted: true, docsSigned: true, depositPaid: false, finalPaid: false };
                        } else {
                            status = 'Confirmed'; checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: false };
                        }
                    } else {
                        status = 'Paid'; checklist = { accepted: true, docsSigned: true, depositPaid: true, finalPaid: true };
                    }
                }
            } else {
                status = 'Provisional';
                checklist = { accepted: false, docsSigned: false, depositPaid: false, finalPaid: false };
            }

            booking.status = status;
            booking.checklist = checklist;
            booking.notes = [];
            return status;
        }

        var globalIndex = 0;
        window.BOOKINGS_DATA.forEach(function(b) {
            // Skip entries with invalid dates (e.g. "TBC", "Checking", "Sept")
            if (!datePattern.test(b.bookingDate)) return;

            var booking = Object.assign({}, b);
            booking.status = assignWorkflowStatus(booking, globalIndex);
            globalIndex++;
            bookings.push(booking);

            var validDate = true;
            if (b.recurringWeeks > 0 && validDate) {
                var baseDate = new Date(b.bookingDate + 'T00:00:00');
                if (isNaN(baseDate.getTime())) return;
                for (var w = 1; w <= b.recurringWeeks; w++) {
                    var nextDate = new Date(baseDate);
                    nextDate.setDate(nextDate.getDate() + (w * 7));
                    var clone = Object.assign({}, b);
                    clone.bookingDate = nextDate.toISOString().split('T')[0];
                    clone.status = assignWorkflowStatus(clone, globalIndex);
                    globalIndex++;
                    bookings.push(clone);
                }
            }
        });

        // Add demo notes to some bookings for realism
        var demoNotes = [
            { match: 'Overdue', notes: [
                { author: 'Alyson B.', date: '2026-03-10 09:15', text: 'Sent invoice reminder by email. No response yet.' },
                { author: 'Alyson B.', date: '2026-03-15 14:30', text: 'Called and left voicemail about outstanding balance.' }
            ]},
            { match: 'Provisional', notes: [
                { author: 'Alyson B.', date: '2026-03-18 11:00', text: 'New enquiry received. Need to check availability against existing bookings.' }
            ]},
            { match: 'Accepted', notes: [
                { author: 'Alyson B.', date: '2026-03-14 10:20', text: 'Booking accepted. Sent conditions of hire documents for signing.' }
            ]}
        ];
        bookings.forEach(function(b, i) {
            var rand = seededRandom(i + 500);
            demoNotes.forEach(function(dn) {
                if (b.status === dn.match && rand < 0.35) {
                    b.notes = dn.notes.map(function(n) { return Object.assign({}, n); });
                }
            });
            // Special case: add realistic notes to a few specific scenarios
            if (b.status === 'Overdue' && rand >= 0.35 && rand < 0.7) {
                b.notes = [
                    { author: 'Alyson B.', date: '2026-03-12 16:45', text: 'Got a cheque for the balance but it bounced. Chasing up.' },
                    { author: 'Margaret T.', date: '2026-03-13 09:00', text: 'They said they will pay by bank transfer this week.' }
                ];
            }
            if (b.status === 'Rejected' && rand < 0.3) {
                b.notes = [
                    { author: 'Alyson B.', date: '2026-03-05 11:30', text: '18th birthday party — declined per committee policy. Suggested alternative venues.' }
                ];
            }
            if (b.status === 'Paid' && rand < 0.05) {
                b.notes = [
                    { author: 'Margaret T.', date: '2026-03-16 10:00', text: 'They left the place in a tip. Recommend keeping the deposit to cover extra cleaning.' },
                    { author: 'Alyson B.', date: '2026-03-16 14:00', text: 'Agreed — deposit retained. Emailed hirer with explanation and photos.' }
                ];
            }
        });

        var types = {};
        bookings.forEach(function(b) { if (b.eventType) types[b.eventType] = true; });
        Object.keys(types).sort().forEach(function(t) {
            var opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            filterType.appendChild(opt);
        });

        renderSummaryCards();
        applyFiltersAndRender();
        initAdminCalendar();
        setupEventListeners();
    }

    // --- SUMMARY CARDS ---
    function renderSummaryCards() {
        var provisional = bookings.filter(function(b) { return b.status === 'Provisional'; }).length;
        var accepted = bookings.filter(function(b) { return b.status === 'Accepted'; }).length;
        var confirmed = bookings.filter(function(b) { return b.status === 'Confirmed'; }).length;
        var overdue = bookings.filter(function(b) { return b.status === 'Overdue'; }).length;

        var cards = [
            { label: 'Needs Action', value: provisional, color: '#DC2626' },
            { label: 'Accepted', value: accepted, color: 'var(--amber)' },
            { label: 'Confirmed', value: confirmed, color: '#3B82F6' },
            { label: 'Overdue Payment', value: overdue, color: '#7C2D12' }
        ];

        dashCards.innerHTML = cards.map(function(c) {
            return '<div class="summary-card" style="border-left-color:' + c.color + '">' +
                   '<h3>' + c.value + '</h3><p>' + c.label + '</p></div>';
        }).join('');
    }

    // --- FILTERING ---
    function getFilteredBookings() {
        var search = searchInput.value.toLowerCase();
        var type = filterType.value;
        var status = filterStatus.value;
        var from = filterFrom.value;
        var to = filterTo.value;

        return bookings.filter(function(b) {
            if (type && b.eventType !== type) return false;
            if (status && b.status !== status) return false;
            if (from && b.bookingDate < from) return false;
            if (to && b.bookingDate > to) return false;
            if (search) {
                var haystack = [b.firstName, b.lastName, b.email, b.eventType, b.description]
                    .join(' ').toLowerCase();
                if (haystack.indexOf(search) === -1) return false;
            }
            return true;
        });
    }

    function getTimeUntil(bookingDate) {
        if (!bookingDate || !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) return '';
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var event = new Date(bookingDate + 'T00:00:00');
        var diffMs = event - today;
        var diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            var absDays = Math.abs(diffDays);
            if (absDays === 1) return '1 day ago';
            if (absDays < 7) return absDays + ' days ago';
            if (absDays < 30) return Math.floor(absDays / 7) + ' week' + (Math.floor(absDays / 7) > 1 ? 's' : '') + ' ago';
            if (absDays < 365) return Math.floor(absDays / 30) + ' month' + (Math.floor(absDays / 30) > 1 ? 's' : '') + ' ago';
            return Math.floor(absDays / 365) + ' year' + (Math.floor(absDays / 365) > 1 ? 's' : '') + ' ago';
        }
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays <= 7) return 'In ' + diffDays + ' days';
        if (diffDays <= 30) return 'In ' + Math.ceil(diffDays / 7) + ' week' + (Math.ceil(diffDays / 7) > 1 ? 's' : '');
        if (diffDays <= 90) return 'In ' + Math.round(diffDays / 30) + ' month' + (Math.round(diffDays / 30) > 1 ? 's' : '');
        if (diffDays <= 365) return 'Over ' + Math.round(diffDays / 30) + ' months away';
        return 'Over a year away';
    }

    function sortArray(arr) {
        return arr.slice().sort(function(a, b) {
            var aVal = a[sortField] || '';
            var bVal = b[sortField] || '';
            if (sortField === 'hours') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    function applyFiltersAndRender() {
        var filtered = sortArray(getFilteredBookings());
        renderTable(filtered);
        renderMobileCards(filtered);
        renderPagination(filtered.length);
    }

    // --- TABLE ---
    function renderTable(filtered) {
        var start = (currentPage - 1) * perPage;
        var page = filtered.slice(start, start + perPage);

        tableBody.innerHTML = page.map(function(b, i) {
            var statusClass = 'status-badge--' + b.status.toLowerCase();
            var dateFormatted = '';
            if (b.bookingDate && /^\d{4}-\d{2}-\d{2}$/.test(b.bookingDate)) {
                dateFormatted = new Date(b.bookingDate + 'T00:00:00')
                    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            } else if (b.bookingDate) {
                dateFormatted = b.bookingDate;
            }
            var dueText = getTimeUntil(b.bookingDate);
            var isPaid = b.status === 'Paid' || b.status === 'Rejected';
            var dueClass = isPaid ? 'due-past' : (dueText === 'Today' || dueText === 'Tomorrow' || (dueText.indexOf('days') > -1 && dueText.indexOf('ago') === -1) ? 'due-soon' : 'due-later');
            var rowClass = b.status === 'Provisional' ? ' class="row--provisional"' : (b.status === 'Overdue' ? ' class="row--overdue"' : '');
            return '<tr data-index="' + (start + i) + '"' + rowClass + '>' +
                '<td>' + dateFormatted + '</td>' +
                '<td>' + (b.bookingTime || '-') + '</td>' +
                '<td>' + b.hours + ' hrs</td>' +
                '<td>' + b.firstName + ' ' + b.lastName + '</td>' +
                '<td>' + (b.eventType || '-') + '</td>' +
                '<td>' + (b.phone || b.email || '-') + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + b.status + '</span></td>' +
                '<td><span class="due-label ' + dueClass + '">' + dueText + '</span></td>' +
                '</tr>';
        }).join('');
    }

    // --- MOBILE CARDS ---
    function renderMobileCards(filtered) {
        var start = (currentPage - 1) * perPage;
        var page = filtered.slice(start, start + perPage);

        cardsList.innerHTML = page.map(function(b, i) {
            var statusClass = 'status-badge--' + b.status.toLowerCase();
            var dateFormatted = '';
            if (b.bookingDate && /^\d{4}-\d{2}-\d{2}$/.test(b.bookingDate)) {
                dateFormatted = new Date(b.bookingDate + 'T00:00:00')
                    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            } else if (b.bookingDate) {
                dateFormatted = b.bookingDate;
            }
            var dueText = getTimeUntil(b.bookingDate);
            var cardClass = b.status === 'Provisional' ? 'booking-card card--provisional' : (b.status === 'Overdue' ? 'booking-card card--overdue' : 'booking-card');
            return '<div class="' + cardClass + '" data-index="' + (start + i) + '">' +
                '<h4>' + b.firstName + ' ' + b.lastName + '</h4>' +
                '<p>' + dateFormatted + ' at ' + (b.bookingTime || '-') + ' &middot; ' + b.hours + ' hrs</p>' +
                '<p>' + (b.eventType || '') + '</p>' +
                '<span class="status-badge ' + statusClass + '">' + b.status + '</span>' +
                (dueText ? ' <span class="due-label">' + dueText + '</span>' : '') +
                '</div>';
        }).join('');
    }

    // --- PAGINATION ---
    function renderPagination(total) {
        var totalPages = Math.ceil(total / perPage);
        if (totalPages <= 1) { pagination.innerHTML = ''; return; }

        var html = '<button class="page-btn" data-page="prev">&laquo;</button>';

        var pages = [];
        if (totalPages <= 7) {
            for (var i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            var start = Math.max(2, currentPage - 1);
            var end = Math.min(totalPages - 1, currentPage + 1);
            for (var j = start; j <= end; j++) pages.push(j);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }

        pages.forEach(function(p) {
            if (p === '...') {
                html += '<span class="page-ellipsis">&hellip;</span>';
            } else {
                html += '<button class="page-btn' + (p === currentPage ? ' active' : '') +
                        '" data-page="' + p + '">' + p + '</button>';
            }
        });

        html += '<button class="page-btn" data-page="next">&raquo;</button>';
        pagination.innerHTML = html;
    }

    // --- DETAIL PANEL ---
    function openPanel(booking) {
        activeBooking = booking;
        panelTitle.textContent = booking.firstName + ' ' + booking.lastName;

        var dueText = getTimeUntil(booking.bookingDate);
        var dateFormatted = '';
        if (booking.bookingDate && /^\d{4}-\d{2}-\d{2}$/.test(booking.bookingDate)) {
            dateFormatted = new Date(booking.bookingDate + 'T00:00:00')
                .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
        panelSubtitle.textContent = (booking.eventType || '') + (dateFormatted ? ' — ' + dateFormatted : '') + (dueText ? ' (' + dueText + ')' : '');

        renderPanelBody();

        detailPanel.classList.add('open');
        panelOverlay.style.display = 'block';
    }

    function renderPanelBody() {
        var booking = activeBooking;
        if (!booking) return;

        // --- Status section ---
        var statuses = ['Provisional', 'Accepted', 'Confirmed', 'Paid', 'Rejected', 'Overdue'];
        var statusOptions = statuses.map(function(s) {
            return '<option value="' + s + '"' + (booking.status === s ? ' selected' : '') + '>' + s + '</option>';
        }).join('');
        var statusHtml = '<div class="panel-section">' +
            '<h4>Status</h4>' +
            '<select class="panel-status-select" id="panelStatusSelect">' + statusOptions + '</select>' +
            '</div>';

        // --- Checklist section ---
        var cl = booking.checklist || {};
        var steps = [
            { key: 'accepted', label: 'Booking accepted' },
            { key: 'docsSigned', label: 'Documents signed' },
            { key: 'depositPaid', label: 'Deposit paid' },
            { key: 'finalPaid', label: 'Final balance paid' }
        ];
        var checklistHtml = '<div class="panel-section"><h4>Booking Progress</h4><ul class="checklist">';
        steps.forEach(function(step) {
            var done = cl[step.key];
            var icon = done ? '&#10003;' : '';
            var doneClass = done ? 'checklist-done' : 'checklist-pending';
            checklistHtml += '<li class="checklist-item ' + doneClass + '" data-key="' + step.key + '">' +
                '<span class="checklist-box">' + icon + '</span>' +
                '<span class="checklist-label">' + step.label + '</span></li>';
        });
        checklistHtml += '</ul></div>';

        // --- Details section ---
        var fields = [
            ['Phone', booking.phone],
            ['Email', booking.email],
            ['Description', booking.description],
            ['Duration', booking.hours + ' hours'],
            ['Time', booking.bookingTime],
            ['Age of Child', booking.childAge && booking.childAge !== 'N/A' ? booking.childAge : null],
            ['Entry ID', booking.entryId]
        ].filter(function(f) { return f[1]; });

        var detailsHtml = '<div class="panel-section"><h4>Booking Details</h4><dl class="panel-details">' +
            fields.map(function(f) {
                return '<dt>' + f[0] + '</dt><dd>' + f[1] + '</dd>';
            }).join('') + '</dl></div>';

        // --- Notes section ---
        var notes = booking.notes || [];
        var notesHtml = '<div class="panel-section panel-notes-section"><h4>Internal Notes <span class="notes-count">' + notes.length + '</span></h4>';
        notesHtml += '<div class="notes-list" id="notesList">';
        if (notes.length === 0) {
            notesHtml += '<p class="notes-empty">No notes yet. Add one below.</p>';
        } else {
            notes.forEach(function(n) {
                notesHtml += '<div class="note-item">' +
                    '<div class="note-header"><strong>' + n.author + '</strong><span class="note-date">' + n.date + '</span></div>' +
                    '<p class="note-text">' + n.text + '</p></div>';
            });
        }
        notesHtml += '</div>';
        notesHtml += '<div class="note-input-wrap">' +
            '<textarea id="noteInput" class="note-input" placeholder="Add a note..." rows="3"></textarea>' +
            '<button class="btn btn--primary btn--sm" id="addNoteBtn">Add Note</button>' +
            '</div></div>';

        panelBody.innerHTML = statusHtml + checklistHtml + detailsHtml + notesHtml;

        // Wire up interactions
        document.getElementById('panelStatusSelect').addEventListener('change', function() {
            booking.status = this.value;
            applyFiltersAndRender();
            renderSummaryCards();
        });

        panelBody.querySelectorAll('.checklist-item').forEach(function(li) {
            li.style.cursor = 'pointer';
            li.addEventListener('click', function() {
                var key = li.dataset.key;
                booking.checklist[key] = !booking.checklist[key];
                renderPanelBody();
            });
        });

        document.getElementById('addNoteBtn').addEventListener('click', function() {
            var input = document.getElementById('noteInput');
            var text = input.value.trim();
            if (!text) return;
            booking.notes.push({
                author: 'You',
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                text: text
            });
            renderPanelBody();
            // Scroll notes into view
            var notesList = document.getElementById('notesList');
            notesList.scrollTop = notesList.scrollHeight;
        });
    }

    function closePanel() {
        detailPanel.classList.remove('open');
        panelOverlay.style.display = 'none';
        activeBooking = null;
    }

    // --- ADMIN CALENDAR ---
    var adminCalMonth, adminCalYear;

    function initAdminCalendar() {
        adminCalMonth = new Date().getMonth();
        adminCalYear = new Date().getFullYear();
        renderAdminCalendar(adminCalMonth, adminCalYear);

        document.getElementById('adminCalPrev').addEventListener('click', function() {
            adminCalMonth--;
            if (adminCalMonth < 0) { adminCalMonth = 11; adminCalYear--; }
            renderAdminCalendar(adminCalMonth, adminCalYear);
        });

        document.getElementById('adminCalNext').addEventListener('click', function() {
            adminCalMonth++;
            if (adminCalMonth > 11) { adminCalMonth = 0; adminCalYear++; }
            renderAdminCalendar(adminCalMonth, adminCalYear);
        });
    }

    function renderAdminCalendar(month, year) {
        var grid = document.getElementById('adminCalGrid');
        var monthNames = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December'];
        document.getElementById('adminCalMonthYear').textContent = monthNames[month] + ' ' + year;

        grid.innerHTML = '';
        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var today = new Date(); today.setHours(0,0,0,0);

        for (var e = 0; e < firstDay; e++) {
            var empty = document.createElement('div');
            empty.className = 'calendar-day calendar-day--empty';
            grid.appendChild(empty);
        }

        for (var d = 1; d <= daysInMonth; d++) {
            var cell = document.createElement('div');
            cell.className = 'calendar-day';
            var dateStr = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');

            var dayBookings = bookings.filter(function(b) { return b.bookingDate === dateStr; });
            var totalHrs = dayBookings.reduce(function(sum, b) { return sum + (b.hours || 0); }, 0);

            cell.textContent = d;
            cell.dataset.date = dateStr;

            var cellDate = new Date(year, month, d);
            if (cellDate < today) cell.classList.add('calendar-day--past');
            else if (totalHrs >= 12) cell.classList.add('calendar-day--booked');
            else if (totalHrs > 0) cell.classList.add('calendar-day--partial');
            if (cellDate.getTime() === today.getTime()) cell.classList.add('calendar-day--today');

            if (dayBookings.length > 0) {
                cell.style.cursor = 'pointer';
                cell.addEventListener('click', (function(ds) {
                    return function() { showDayBookings(ds); };
                })(dateStr));
            }

            grid.appendChild(cell);
        }
    }

    function showDayBookings(dateStr) {
        var panel = document.getElementById('dayPanelList');
        var title = document.getElementById('dayPanelTitle');
        var dayBookings = bookings.filter(function(b) { return b.bookingDate === dateStr; });

        var d = new Date(dateStr + 'T00:00:00');
        title.textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        if (dayBookings.length === 0) {
            panel.innerHTML = '<p class="day-panel-empty">No bookings on this date</p>';
            return;
        }

        panel.innerHTML = dayBookings.map(function(b) {
            return '<div class="day-panel-item">' +
                '<strong>' + (b.bookingTime || '-') + '</strong> &middot; ' + b.hours + ' hrs<br>' +
                b.firstName + ' ' + b.lastName + '<br>' +
                '<span style="color:var(--warm-gray)">' + (b.eventType || '') + '</span>' +
                '</div>';
        }).join('');
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        searchInput.addEventListener('input', function() { currentPage = 1; applyFiltersAndRender(); });
        filterType.addEventListener('change', function() { currentPage = 1; applyFiltersAndRender(); });
        filterStatus.addEventListener('change', function() { currentPage = 1; applyFiltersAndRender(); });
        filterFrom.addEventListener('change', function() { currentPage = 1; applyFiltersAndRender(); });
        filterTo.addEventListener('change', function() { currentPage = 1; applyFiltersAndRender(); });

        document.querySelectorAll('.dash-table th[data-sort]').forEach(function(th) {
            th.addEventListener('click', function() {
                var field = th.dataset.sort;
                if (sortField === field) {
                    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    sortField = field;
                    sortDir = 'asc';
                }
                document.querySelectorAll('.sort-icon').forEach(function(s) { s.textContent = ''; });
                th.querySelector('.sort-icon').textContent = sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
                applyFiltersAndRender();
            });
        });

        pagination.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-page]');
            if (!btn) return;
            var filtered = sortArray(getFilteredBookings());
            var totalPages = Math.ceil(filtered.length / perPage);
            var page = btn.dataset.page;
            if (page === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (page === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else currentPage = parseInt(page);
            applyFiltersAndRender();
        });

        tableBody.addEventListener('click', function(e) {
            var row = e.target.closest('tr[data-index]');
            if (!row) return;
            var filtered = sortArray(getFilteredBookings());
            openPanel(filtered[parseInt(row.dataset.index)]);
        });

        cardsList.addEventListener('click', function(e) {
            var card = e.target.closest('.booking-card[data-index]');
            if (!card) return;
            var filtered = sortArray(getFilteredBookings());
            openPanel(filtered[parseInt(card.dataset.index)]);
        });

        panelClose.addEventListener('click', closePanel);
        panelOverlay.addEventListener('click', closePanel);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closePanel();
        });

        viewTable.addEventListener('click', function() {
            viewTable.classList.add('active');
            viewCalendar.classList.remove('active');
            tableView.style.display = '';
            calendarView.style.display = 'none';
        });
        viewCalendar.addEventListener('click', function() {
            viewCalendar.classList.add('active');
            viewTable.classList.remove('active');
            tableView.style.display = 'none';
            calendarView.style.display = '';
        });

        if (filtersToggle) {
            filtersToggle.addEventListener('click', function() {
                var controls = document.querySelector('.dash-controls');
                controls.classList.toggle('dash-controls--open');
            });
        }
    }
});
