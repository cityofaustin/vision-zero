#!/usr/bin/perl

use strict;
use Data::Dumper;
use File::Path qw(make_path remove_tree);
use DBI;

#my $pg = DBI->connect("DBI:Pg:dbname=diagrams;host=localhost;port=5440", 'frank', '', {RaiseError => 1});

#my @ids = (14591688, 14640807, 14675892, 15153649, 15172898, 15174908, 15178705, 15259841, 15331065, 15372092, 15532651, 16151126, 16175123, 16209773, 16462196, 16823782, 16932832, 17085825, 17219565, 17242089, 17468110, 17655095);

my @ids = (14792846, 14844466, 14878671, 15017737, 15131486, 15191183, 15228471, 15314175, 15396202, 15446701, 15578227, 15597881, 15831314, 15948451, 16058696, 15987052, 16005272, 16079148, 16099265, 16106275, 16133862, 16148342, 16170820, 16185968, 16175878, 16275224, 16343590, 16558355, 16584458, 16617643, 16697199, 16716059, 16729109, 16950252, 17017161, 17180201, 17242086, 17286102, 17316251, 17330323, 17372044, 17433721, 17524334, 17726449);

my $pwd = `pwd`;
chomp $pwd;
my $path = $pwd . "/gracy_farms_at_burnet/outside/";
make_path($path);

foreach my $crash (@ids)
  {
  my $cmd = 'docker run --rm -it -v ~/.aws-dts:/root/.aws -v ' . $path . ':/mnt amazon/aws-cli s3 cp s3://atd-vision-zero-editor/production/cris-cr3-files/' . $crash . '.pdf /mnt/' . $crash . '.pdf';
  print $cmd, "\n";
  `$cmd`;
  }
