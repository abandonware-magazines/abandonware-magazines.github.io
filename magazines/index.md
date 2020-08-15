---
title: המגזינים
layout: basic_page
---

<p class="lead">
האתר מכיל את המגזינים הבאים:
</p>
<ul>
    {% assign magazines = site.data.magazines | sort: 'name' %}
    {% for magazine in magazines %}
    <li><a href="/magazines/{{ magazine.id }}.html">{{ magazine.name }}</a></li>
    {% endfor %}
</ul>