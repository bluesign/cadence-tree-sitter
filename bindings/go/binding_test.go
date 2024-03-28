package tree_sitter_cadence_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	tree_sitter_cadence "github.com/tree-sitter/tree-sitter-cadence"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_cadence.Language())
	if language == nil {
		t.Errorf("Error loading Cadence grammar")
	}
}
