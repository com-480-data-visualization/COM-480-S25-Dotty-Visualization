import tasty.buildReferences
val scala3Versions = Seq(
  // "3.7.0",
  "3.6.4",
  "3.6.3",
  "3.6.2",
  "3.5.2",
  "3.5.1",
  "3.5.0",
  "3.4.3",
  "3.4.2",
  "3.4.1",
  "3.4.0",
  "3.3.6",
  "3.3.5",
  "3.3.4",
  "3.3.3",
  "3.3.1",
  "3.3.0",
  "3.2.2",
  "3.2.1",
  "3.2.0",
  "3.1.3",
  "3.1.2",
  "3.1.1",
  "3.1.0",
  "3.0.2",
  "3.0.1",
  "3.0.0"
)

@main def main() =
  println("Building references...")

  for version <- scala3Versions do
    print(s"Scala $version... ")
    buildReferences(version)
    println("done")
