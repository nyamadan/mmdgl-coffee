LIB_SRC	= core.coffee binary.coffee encode.coffee
LIB_JS	= mmdgl.js

BINTEST_SRC	= bintest.coffee
BINTEST_JS	= bintest.js

all: $(LIB_JS) $(BINTEST_JS)

$(LIB_JS): $(LIB_SRC)
	coffee -j $@ -c $^

$(BINTEST_JS): $(BINTEST_SRC)
	coffee -j $@ -c $(BINTEST_SRC)

clean:
	rm -f $(LIB_JS) $(BINTEST_JS)
