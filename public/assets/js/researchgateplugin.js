// ###### ResearchGate Plugin ######
(function() { var st = document.createElement('script'); st.type = 'text/javascript'; st.async = true; st.src = 'https://www.researchgate.net/javascript/plugin/plugin-api-min.js'; var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(st, s); })();

const rgPlugin = document.querySelector('.rg-plugin');

if (document.body.clientWidth >= 600) {
  rgPlugin.setAttribute('data-width', 600);
}