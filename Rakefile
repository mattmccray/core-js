desc "Build distributable version(s) of core.js"
task :build do

  puts "Building core.js..."
  begin
    require 'sprockets'
  rescue
    puts "Build require sprockets:"
    puts
    puts "  gem install sprockets"
    puts
    exit(1)
  end
  
  secretary = Sprockets::Secretary.new(
    :load_path    => ["src", "lib", "."],
    :source_files => ["src/core.js"]
  )

  # Generate a Sprockets::Concatenation object from the source files
  concatenation = secretary.concatenation
  # Write the concatenation to disk
  concatenation.save_to("dist/core.src.js")
  
  # puts "Piping liquid.js through jsmin..."
  # `cat dist/liquid.js | jsmin > dist/liquid.min.js`

  puts "Piping core.src.js through yuicompressor..."
  `java -jar $HOME/Library/bin/yuicompressor-2.4.2.jar -o dist/core.min.js dist/core.src.js`
  
  puts 'Done.'
  
end

task :default do
  puts `rake -T`
end