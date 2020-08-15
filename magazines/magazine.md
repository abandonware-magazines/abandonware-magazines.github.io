---
title: צפייה בדפים מתוך מגזין
layout: basic_page
iviewer: True
---

<div id="iviewer_wrapper"></div>

<script>
const magazine_name_mapping = {
    {% assign magazines = site.data.magazines | sort: 'name' %}
    {% for magazine in magazines %}
    {{ magazine.id | downcase }}: '{{ magazine.name | escape }}',
    {% endfor %}
};
</script>