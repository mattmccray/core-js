#!/usr/bin/env ruby

# TODO: Convert this from TextMate bundle item to standalone(ish) script.

# Sprocketize JS

# class String
#   def starts_with?(prefix)
#     prefix = prefix.to_s
#     self[0, prefix.length] == prefix
#   end
# end
# 
# def options_for_file(file)
#   file = File.expand_path(file)
#   file_dir = File.dirname(file)
#   Dir.chdir( file_dir )
# 
#   outfile = file.gsub(".js", ".all.js")
#   matcher = /^\/\/!(.*):(.*)$/
# 
#   options = {
#     'input' => file,
#     'output' => outfile,
#     'file_dir' => file_dir
#   }
# 
#   IO.readlines(file).each do |line|
#     if line.starts_with? '//!'
#       if line =~ matcher
#         name = $1.strip
#         value = $2.strip
#         options[name] = value
#       end
#     end
#   end
#   options
# end
# 
# file = ENV["TM_FILEPATH"] || STDIN.read[/js: ([^*]+\.js)/, 1]
# 
# options = options_for_file(file)
# 
# if options['main']
#   options = options_for_file( File.expand_path( options['main'] ))
# end
# 
# load_paths = ['.']
# 
# if options['lib_path']
#   load_paths << options['lib_path'].split(',')
#   load_paths.flatten!
# end
# 
# 
# cmd = %Q|/usr/bin/sprocketize -C "#{ options['file_dir'] }" -I "#{ load_paths.join('" -I "')}" "#{ options['input'] }" > "#{ options['output'] }"|
# system(cmd)
# 
# if options['minify_to']
#   mincmd = %Q|/bin/cat "#{ options['output'] }" \| $HOME/Library/bin/jsmin > "#{ options['minify_to'] }"|
#   system(mincmd)
# end
# 
# if options['yuic_to']
#   ymincmd = %Q|/usr/bin/java -jar $HOME/Library/bin/yuicompressor-2.4.2.jar -o "#{ options['yuic_to'] }" #{ options['output']}|
#   system(ymincmd)
# end
# 
# 
# # Growl...
# system("/usr/local/bin/growlnotify -m \"Sprocketized #{File.basename(options['output'])}\" -i js -t \"Sprocketizr\"")
