# Frame

The first release of Frame was completed and released December 25th, 2018.

Frame is a notetaking / journaling web and desktop application with natural language processing features, that allows users to retrieve informed answers in context to questions they can ask in the UI. Frame also automatically generates summaries (both extractive and abstractive) of the text. This analysis is done in real-time (on save), and can navigated intuitively while still editing the content. Frame is designed for introspective and analytical users (researchers and academics might be most interested in this).

Frame is fully functional without running the Python backend (no online API is available at this time). Most of the analysis is done within the app itself (with no external server calls). The data storage uses localForage (IndexedDB), which allows easy mass distribution for Frame (your data self-contained and never sent anywhere outside the local app or browser). Data can be exported and imported as JSON.

Eventually, a donation-supported / subscription-based edition could be serviced for online users through a server on the cloud, with extended features and protected data storage, and automated data extraction / ingestion.

## Current Screenshots (12-23-2018)

This is a fully functional build, without the Python backend running for the Ask freature.

<img src="screenshots/frame-screenshot-12-23-2018-1.png" height="250" alt="Frame - Screenshot 1"/>

<img src="screenshots/frame-screenshot-12-23-2018-2.png" height="250" alt="Frame - Screenshot 3"/>

<img src="screenshots/frame-screenshot-12-23-2018-4.png" height="250" alt="Frame - Screenshot 4"/>

<img src="screenshots/frame-screenshot-12-23-2018-5.png" height="250" alt="Frame - Screenshot 5"/>

<img src="screenshots/frame-screenshot-12-23-2018-6.png" height="250" alt="Frame - Screenshot 6"/>

## Web UI

A public-serving site is accessible at []().

Because Frame's data storage uses the local browser of the user, no user management is needed, as the entries you write are stored in your local browser cache. 

## Desktop UI

Download the Windows release of version 0.1.0 here: []()

There is no MacOS build, but it should be able to be built with no modifications. If you have a Mac and are willing to create and upload a build, reach out! Thanks. Linux will hopefully come soon too (not tested yet).

# Future

# Acknowledgements

Additional libraries and references used:

- AllenNLP [https://allennlp.org/](https://allennlp.org/)
- Ant Design [https://ant.design/](https://ant.design/)
- compromise [https://github.com/spencermountain/compromise](https://github.com/spencermountain/compromise)
- Draft.js [https://draftjs.org/](https://draftjs.org/)
- franc [https://github.com/wooorm/franc](https://github.com/wooorm/franc)
- electron-builder [https://www.electron.build/](https://www.electron.build/)
- LocalForage [https://localforage.github.io/localForage/](https://localforage.github.io/localForage/)
- medium-draft [https://github.com/brijeshb42/medium-draft](https://github.com/brijeshb42/medium-draft)
- node-sumbasic [https://github.com/MSVCode/node-sumbasic](https://github.com/MSVCode/node-sumbasic)
- React Draft WYSIWYG [https://jpuri.github.io/react-draft-wysiwyg/#/](https://jpuri.github.io/react-draft-wysiwyg/#/)
- react-aria-tabpanel [https://github.com/davidtheclark/react-aria-tabpanel](https://github.com/davidtheclark/react-aria-tabpanel)
- react-electron-web-boilerplate [https://github.com/MikeyFriedChicken/react-electron-web-boilerplate](https://github.com/MikeyFriedChicken/react-electron-web-boilerplate)
- react-json-view [https://github.com/mac-s-g/react-json-view](https://github.com/mac-s-g/react-json-view)
- react-sortable-tree [https://github.com/frontend-collective/react-sortable-tree](https://github.com/frontend-collective/react-sortable-tree)
- Recharts [https://github.com/recharts/recharts](https://github.com/recharts/recharts)
- uwsgi-nginx-flask-docker [uwsgi-nginx-flask-docker](uwsgi-nginx-flask-docker)