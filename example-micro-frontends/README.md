# Micro Frontends

Gatsby can be used to build world class UX focused micro frontends, where everything is page based and optimized for a fantastic user and a11y experience – while still deliver micro frontend independence in terms of DX and dedicated developer teams.

But the only peace missing is to easily customize what layout and what data provider is used by every micro application.

Now, **gatsby-plugin-wrap-pages** can be included by every mirco app independently. They even can define what they want to call the wrapper files (`wrapperName`) by itself. Or if that matters, it can be used just by one micro app – even if the root application is not aware of this plugin.
