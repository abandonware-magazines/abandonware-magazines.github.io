---
title: Magazines
layout: default
---
<ul>
    {% for magazine in site.data.magazines %}
        <li>
            {{ magazine.name }}
        </li>
    {% endfor %}
</ul>
