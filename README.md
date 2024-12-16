### Wifey Material Quiz

Feature Plan
Quiz Questions & Answers Logic

Questions will be stored in a JSON file for simplicity, or optionally in a database (e.g., Firebase or Supabase) if dynamic updates are needed.
Questions can have weighted scores for specific answers.
Answers will be evaluated to determine if they are "wifey material" or not.
UI Components

Language Selector (dropdown or button toggle group).
Quiz Form with Radio Buttons and Checkboxes.
Score Display and Feedback (Green/Red flags with explanations).
"Start Over" and "Submit" buttons.
State Management

Use React state or Context API for managing selected answers, scores, and language.
Tailor the percentage score calculation to handle weighted questions.
Localization (i18n)

Store quiz translations in a locales directory with JSON files for each language (e.g., en.json, th.json).
Dynamically load translations based on selected language.
Donation Buttons

Add links/buttons to PayPal and Buy Me a Coffee.
