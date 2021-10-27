#!/usr/bin/perl

use strict;

use File::Path qw(make_path);

# Three test crash IDs
my @ids = (14792846, 14844466, 14878671);

my $pwd = `pwd`;
chomp $pwd;
my $path = $pwd . "/downloaded_files/";
make_path($path);

foreach my $crash (@ids)
  {
  my $cmd = 'docker run --rm -it -v ~/.aws-dts:/root/.aws -v ' . $path . ':/mnt amazon/aws-cli s3 cp s3://atd-vision-zero-editor/production/cris-cr3-files/' . $crash . '.pdf /mnt/' . $crash . '.pdf';
  print $cmd, "\n";
  `$cmd`;
  }
