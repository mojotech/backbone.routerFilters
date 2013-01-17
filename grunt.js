/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.test.js']
    },
    watch: {
      files: ['<config:lint.files>', 'test/index.html'],
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
      globals: {
        Backbone: true,
        _: true
      }
    },
    qunit: {
      index: ['test/index.html']
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit watch');
};
