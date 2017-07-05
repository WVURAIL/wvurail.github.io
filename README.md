# WVU Radio Astronomy Instrumentation Lab

This is the webpage for the WVU Astronomy Instrumemtation Lab


### Adding New Projects

Edit projects.html in ``_includes`` directory. Follow the style as previous entry except flip alignment

### Add new members

- Add person to ``data/people.yml``
- For Faculty mimic section under the faculty container
- For Graduate Student members -- edit CSS in ''head.html'' if odd number of graduate students and ``people.html''.

### Adding Pages

Create desired markdown file in ``_page`` directory and prepend following before content 

```yml
---
layout: page
title: title
permalink: /permalink/
---

content

```

### Writing Posts

To create a new post, all you need to do is create a file in the _posts directory. How you name files in this folder is important. Jekyll requires blog post files to be named according to the following format:

```
YEAR-MONTH-DAY-title.MARKUP
```

The post must have the following on the head (can copy paste with propr ):

```yml
---
title: Post title
layout: post
date: '2017-06-13 20:30:00'
permalink: '/blog/:title'
author: pranav | kevin
---

This is a blog post with normal markup stuff
```