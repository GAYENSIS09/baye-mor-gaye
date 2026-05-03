<?php

namespace App\Services;

class HtmlPurifierService
{
    private array $allowedTags = [
        'p', 'br', 'strong', 'em', 'u', 's',
        'h2', 'h3', 'h4',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a', 'img',
    ];

    private array $allowedAttributes = [
        'a'   => ['href', 'target'],
        'img' => ['src', 'alt', 'width', 'height'],
    ];

    public function purifier(string $html): string
    {
        if (empty(trim($html))) {
            return '';
        }

        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $this->nettoyerNoeud($dom);

        $body = $dom->getElementsByTagName('body')->item(0);
        if ($body) {
            $contenu = '';
            foreach ($body->childNodes as $enfant) {
                $contenu .= $dom->saveHTML($enfant);
            }
            return $contenu;
        }

        return $dom->saveHTML();
    }

    private function nettoyerNoeud(\DOMNode $node): void
    {
        if ($node instanceof \DOMElement) {
            $tag = $node->tagName;

            if (!in_array($tag, $this->allowedTags, true)) {
                $parent = $node->parentNode;
                while ($node->childNodes->length > 0) {
                    $child = $node->childNodes->item(0);
                    $node->removeChild($child);
                    $parent->insertBefore($child, $node);
                }
                $parent->removeChild($node);
                return;
            }

            $attrsToRemove = [];
            foreach ($node->attributes as $attr) {
                $allowed = $this->allowedAttributes[$tag] ?? [];
                if (!in_array($attr->name, $allowed, true)) {
                    $attrsToRemove[] = $attr->name;
                }
            }
            foreach ($attrsToRemove as $name) {
                $node->removeAttribute($name);
            }

            if ($tag === 'a' && $node->hasAttribute('href')) {
                $node->setAttribute('target', '_blank');
            }
        }

        $children = [];
        foreach ($node->childNodes as $child) {
            $children[] = $child;
        }
        foreach ($children as $child) {
            $this->nettoyerNoeud($child);
        }
    }
}
