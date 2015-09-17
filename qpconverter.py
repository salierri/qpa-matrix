#Converts a .qp4 file containing a single pixel into javascript code to be interpreted by mongodb
#Input filename is the first command line argument, output is the second, defaulting to 'suggestion.js'

import sys;

inpath = sys.argv[1]
outpath = sys.argv[2] if len(sys.argv) > 2 else "suggestion.js"
outfile = open(outpath, 'w')

def output(x, y, r, g, b):
	outfile.write("db.pixels.update({x:"+`x`+',y:'+`y`+"},{$set:{suggested:{r:"+`r`+",g:"+`g`+",b:"+`b`+"}}})\n")

def hextorgb(value):
	return tuple(int(value[i:i + 2], 16) for i in range(0, 6, 2))


with open(inpath) as f:
	qp4 = f.readlines()

for i in range(0, 26):
	row = qp4[i + 9].split(',')
	for j in range(0, 32):
		col = row[j]
		if col == '0':
			output(i, j, 0, 0, 0)
		else:
			rgb = hextorgb(col[-6:])
			output(i, j, rgb[0], rgb[1], rgb[2])

outfile.flush()
outfile.close()