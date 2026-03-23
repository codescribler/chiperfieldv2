import csv
import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, '..', 'bookings', 'booking-2026-03-19.csv')
js_path = os.path.join(script_dir, 'bookings-data.js')

bookings = []

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        event_type_raw = row.get('Type of Event', '')
        event_type = event_type_raw.split('|')[0].strip() if event_type_raw else ''

        booking_from = row.get('Booking from', '').strip()
        booking_date = ''
        booking_time = ''
        if booking_from and ' ' in booking_from:
            parts = booking_from.split(' ', 1)
            booking_date = parts[0]
            booking_time = parts[1]
        elif booking_from:
            booking_date = booking_from

        hours_raw = row.get('Hours', '0').strip()
        try:
            hours = float(hours_raw) if hours_raw else 0
        except ValueError:
            hours = 0

        weeks_raw = row.get('How many weeks do you wish to book for?', '').strip()
        try:
            recurring_weeks = int(weeks_raw) if weeks_raw else 0
        except ValueError:
            recurring_weeks = 0

        booking = {
            'firstName': row.get('Name (First)', '').strip(),
            'lastName': row.get('Name (Last)', '').strip(),
            'phone': row.get('Telephone Number', '').strip(),
            'email': row.get('Email', '').strip(),
            'eventType': event_type,
            'description': row.get('Brief Description', '').strip(),
            'bookingDate': booking_date,
            'bookingTime': booking_time,
            'hours': hours,
            'childAge': row.get('Age of Child', '').strip(),
            'recurringWeeks': recurring_weeks,
            'entryId': row.get('Entry ID', '').strip(),
            'entryDate': row.get('Entry Date', '').strip(),
        }
        bookings.append(booking)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write('// Auto-generated from booking-2026-03-19.csv\n')
    f.write('// Re-generate with: python js/csv-to-js.py\n')
    f.write('window.BOOKINGS_DATA = ')
    json.dump(bookings, f, indent=2)
    f.write(';\n')

print(f'Generated {js_path} with {len(bookings)} bookings')
