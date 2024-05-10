# Variant Picker

Variant Picker a simple Browser extension to manage active variants for A/B tests created in **Optimizely Edge**. The main reason behind creating it is the exhaustion of copy-pasting hastle when adjusting url to unblock specifc AB test variant. With this extension you can paste variant ID once, save in the extension and easily switch stored variants on and off when performing development tests.

## How to add to your browser
Clone the repository to your machine, install dependencies with `npm install` and run `npm run build` to build the project. Then upload `/dist` directory as an extension to your browser.

## How to use it
1. Create empty experiment in extension and give it some descriptive name (or Optimizely experiment ID)
2. Add experiment variant - name it and assign a variant ID you can find in Optimizely
3. Click _Activate_ to force you fall in the desired variant bucket

You can also add more variants to each experiment or delete experiments you won't use anymore.
