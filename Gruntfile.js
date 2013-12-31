module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        files: {
            static: {
                tmp: {
                    js: {
                        concatenated: 'tmp/app.concatenated.js'
                    }, 
                    css: {
                        concatenated: 'tmp/app.concatenated.css'
                    }
                },
                release: {
                    path: 'build/public',
                    js: {
                        minified: '<%= files.static.release.path %>/app.min.js'
                    }, 
                    css: {
                        minified: '<%= files.static.release.path %>/app.min.css'
                    }
                },
                dev: {
                    path: 'dev/public'
                }
            },
            server: {
                tmp: {
                    concatenated: 'tmp/server.concatenated.js',
                    path: 'tmp/dev'
                },
                release: {
                    minified: 'build/server.js'
                },
                dev: {
                    path: 'dev'
                }
            }
        },
        vendor: {
            path: 'bower_components',
            modernizr: {
                source: '<%= vendor.path %>/modernizr/modernizr.js'
            },
            bootstrap: {
                less: {
                    path: "<%= vendor.path %>/bootstrap/less/",
                    main: "<%= vendor.bootstrap.less.path %>/bootstrap.less"
                },
                css: {
                    path: "<%= vendor.path %>/bootstrap/dist/css/",
                    source: "<%= vendor.bootstrap.less.path %>/bootstrap.css"
                }
            },
            angular: {
                source: "<%= vendor.path %>/angular/angular.js",
                minified: "<%= vendor.path %>/angular/angular.min.js"
            },
            angularAnimate: {
                source: "<%= vendor.path %>/angular-animate/angular-animate.js",
                minified: "<%= vendor.path %>/angular-animate/angular-animate.min.js"
            },
            angularMoment: {
                source: "<%= vendor.path %>/angular-moment/angular-moment.js",
                minified: "<%= vendor.path %>/angular-moment/angular-moment.min.js"
            },
            underscore: {
                source: "<%= vendor.path %>/underscore/underscore.js",
                minified: "<%= vendor.path %>/underscore/underscore-min.js"
            },
            moment: {
                source: "<%= vendor.path %>/moment/moment.js",
                minified: "<%= vendor.path %>/moment/min/moment.min.js"
            },
            angularUIBootstrap: {
                source: "<%= vendor.path %>/angular-ui-bootstrap/dist/ui-bootstrap-tpls-0.7.0.js",
                minified: "<%= vendor.path %>/angular-ui-bootstrap/dist/ui-bootstrap-tpls-0.7.0.min.js"
            },
            showdown: {
                source: "<%= vendor.path %>/showdown/src/showdown.js",
                minified: "<%= vendor.path %>/showdown/compressed/showdown.js"
            },
            fontAwesome: {
                css: {
                    source: "<%= vendor.path %>/font-awesome/css/font-awesome.css",
                    minified: "<%= vendor.path %>/font-awesome/css/font-awesome.min.css"
                },
                fonts: ['<%= vendor.path %>/font-awesome/fonts/*']
            },
            ionIcons: {
                css: {
                    source: "<%= vendor.path %>/ionicons/css/ionicons.css",
                    minified: "<%= vendor.path %>/ionicons/css/ionicons.css"
                },
                fonts: ['<%= vendor.path %>/ionicons/fonts/*']
            },
            angularMarkdownDirective: {
                source: "<%= vendor.path %>/angular-markdown-directive/markdown.js"
            }
        },
        clean: {
            tmp: ['tmp/**/*'],
            static: ['*.html', '<%= files.static.release.path %>/**/*'],
            build: 'build/**/*',
            dev: 'dev/**/*'
        },
        concat: {
            basic: {
                src: [
                'bower_components/angular-markdown-directive/markdown.js',
                'js/main.js',
                'js/**/*.js'
                ],
                dest: '<%= files.static.tmp.js.concatenated %>'
            },
            postUglify: {
                src: [
                'bower_components/underscore/underscore-min.js',
                'bower_components/moment/min/moment.min.js',
                'bower_components/showdown/compressed/showdown.js',
                'bower_components/angular/angular.min.js',
                'bower_components/angular-animate/angular-animate.min.js',
                'bower_components/angular-ui-bootstrap/dist/ui-bootstrap-tpls-0.7.0.min.js',
                'bower_components/angular-moment/angular-moment.min.js',
                '<%= files.static.tmp.js.concatenated %>'
                ],
                dest: '<%= files.static.release.js.minified %>'
            },
            dev: {
                src: ['js/main.js', 'js/**/*.js'],
                dest: '<%= files.static.dev.path %>/js/main.js'
            }
        },
        ngmin: {
            js: {
                src: '<%= files.static.tmp.js.concatenated %>',
                dest: '<%= files.static.tmp.js.concatenated %>'
            }
        },
        uglify: {
            static: {
                options: {
                    stripbanners: true,
                    report: 'gzip'
                },
                files: {
                    '<%= files.static.tmp.js.concatenated %>' : '<%= files.static.tmp.js.concatenated %>'
                }  
            },
            server: {
                options: {
                    stripbanners: true,
                    mangle: true
                },
                files: [{
                    cwd: 'server',
                    src: '**/*.js',
                    dest: 'build/',
                    expand: true
                }]
            }
        },
        jade: {
            options: {
                pretty: false
            },
            release: {
                files: [{
                    expand: true,
                    src: ['index.jade', 'partials/*.jade'],
                    cwd: 'jade/',
                    dest: '<%= files.static.release.path %>/',
                    ext: '.html'
                }],
                options: {
                    data: {
                        scripts: [
                            'app.min.js'
                        ],
                        styles: [
                            'app.min.css'
                        ]
                    }
                }
            },
            dev: {
                files: [{
                    expand: true,
                    src: ['index.jade', 'partials/*.jade'],
                    cwd: 'jade/',
                    dest: '<%= files.static.dev.path %>/',
                    ext: '.html'
                }],
                options: {
                    pretty: true,
                    data: {
                        scripts: [
                            'js/vendor/underscore.js',
                            'js/vendor/angular.js',
                            'js/vendor/angular-animate.js',
                            'js/vendor/ui-bootstrap-tpls-0.7.0.js',
                            'js/vendor/showdown.js',
                            'js/vendor/markdown.js',
                            'js/vendor/moment.js',
                            'js/vendor/angular-moment.js',
                            'js/vendor/modernizr.js',
                            'js/main.js'
                        ],
                        styles: [
                            'css/bootstrap.css',
                            // 'css/bootstrap-theme.css',
                            // 'css/ionicons.css',
                            'css/font-awesome.css',
                            'css/app.css'
                        ]
                    }
                }
            }
        },
        less: {
            release: {
                files: {
                    '<%= files.static.release.css.minified %>': [
                    '<%= copy.bootstrap.dest %>/bootstrap.less',
                    '<%= vendor.ionIcons.css.minified %>',
                    '<%= copy.bootstrap.dest %>/main.less'
                    ]
                },
                options: {
                    compress: true,
                    cleancss: true
                }
            },
            dev: {
                files: [
                    {
                        src: 'tmp/dev/less/main.less',
                        dest: '<%= files.static.dev.path %>/css/app.css'
                    }
                ],
                options: {
                    compress: false,
                    cleancss: false
                }
            }
        },
        copy: {
            fontAwesome: { 
                expand: true,
                src: ['<%= vendor.fontAwesome.fonts %>'],
                dest: '<%= files.static.release.path %>/fonts/',
                filter: 'isFile',
                flatten: true
            },
            ionIcons: { 
                expand: true,
                src: ['<%= vendor.ionIcons.fonts %>'],
                dest: '<%= files.static.release.path %>/fonts/',
                filter: 'isFile',
                flatten: true
            },
            bootstrap: { 
                expand: true,
                src: ['<%= vendor.bootstrap.less.path %>/*', 'less/*'],
                dest: 'tmp/',
                filter: 'isFile',
                flatten: true
            },
            dev: {
                files: [{
                    expand: true,
                    cwd: 'server/',
                    src: ['**/*.js'],
                    dest: 'dev/',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    src: [
                        '<%= vendor.underscore.source %>',
                        '<%= vendor.moment.source %>',
                        '<%= vendor.showdown.source %>',
                        '<%= vendor.angular.source %>',
                        '<%= vendor.angularAnimate.source %>',
                        '<%= vendor.angularMarkdownDirective.source %>',
                        '<%= vendor.angularUIBootstrap.source %>',
                        '<%= vendor.angularMoment.source %>',
                        '<%= vendor.modernizr.source %>'
                    ],
                    dest: 'dev/public/js/vendor',
                    filter: 'isFile',
                    flatten: true
                },
                // {
                //     expand: true,
                //     src: '<%= vendor.ionIcons.css.source %>',
                //     dest: 'dev/public/css',
                //     filter: 'isFile',
                //     flatten: true
                // },
                // {
                //     expand: true,
                //     src: ['<%= vendor.ionIcons.fonts %>'],
                //     dest: 'dev/public/fonts/',
                //     filter: 'isFile',
                //     flatten: true
                // },
                {
                    expand: true,
                    src: '<%= vendor.fontAwesome.css.source %>',
                    dest: 'dev/public/css',
                    filter: 'isFile',
                    flatten: true
                },
                {
                    expand: true,
                    src: ['<%= vendor.fontAwesome.fonts %>'],
                    dest: 'dev/public/fonts/',
                    filter: 'isFile',
                    flatten: true
                },
                {
                    expand: true,
                    src: ['less/*.less', '<%= vendor.bootstrap.less.path %>/*.less'],
                    dest: 'tmp/dev/less',
                    filter: 'isFile',
                    flatten: true
                },
                {
                    expand: true,
                    src: ['<%= vendor.bootstrap.css.path %>/*'],
                    dest: '<%= files.static.dev.path %>/css/',
                    filter: 'isFile',
                    flatten: true
                }
                ]
            }
        },
        express: {
            dev: {
                options: {
                    port: 8000,
                    script: '<%= files.server.dev.path %>/server.js',
                    background: false,
                    debug: true,
                    cwd: '<%= files.server.dev.path %>'
                }
            },
            release: {
                options: {
                    port: 7000,
                    script: '<%= files.server.release.minified %>',
                    background: false
                }
            }
        },
        watch: {
            server: {
                files: ['server/**/*.js'],
                options: {
                    spawn: false,
                    tasks: ['serve'],
                    background: true
                }
            },
            static: {
                files: ['js/**/*.js', 'jade/**/*.jade', 'less/**/*.less'],
                options: {
                    spawn: false,
                    tasks: ['static'],
                    background: true
                }
            },
            both: {
                files: ['<%= watch.server.files %>', '<%= watch.static.files %>'],
                options: {
                    tasks: 'default'
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-imagine');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('static', [
        'clean:tmp', 'clean:static',
        'concat:basic', 'ngmin', 'uglify:static', 'concat:postUglify',
        'copy:bootstrap', 'less:release', 'copy:fontAwesome', 'jade:release', 'less:release'
    ]);
    
    grunt.registerTask('dev', ['clean:dev','copy:dev', 'less:dev', 'concat:dev', 'jade:dev', 'express:dev']);
    grunt.registerTask('prod', ['static', 'uglify:server', 'express:release']);
    grunt.registerTask('default', ['prod', 'watch:both']);
}
