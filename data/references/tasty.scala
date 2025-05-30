package tasty

import tastyquery._
import java.nio.file.FileSystems
import java.nio.file.Path
import scala.concurrent.Future
import tastyquery.Symbols._
import tastyquery.Trees._
import tastyquery.Traversers.TreeTraverser
import java.nio.file.Paths
import java.nio.file.Files
import java.nio.charset.StandardCharsets
given concurrent.ExecutionContext = scala.concurrent.ExecutionContext.global

def buildReferences(version: String) =
  val scalac = getScalacClasspath(version)
  val classpath = tastyquery.jdk.ClasspathLoaders
    .read(
      List(scalac)
    )
  val ctx = Contexts.Context.initialize(classpath)

  val refs =
    buildFileReferences(using ctx)

  val header = "from,to,weight\n"
  val output = refs.iterator
    .filter { case ((a, b), _) => a != b }
    .toSeq
    .sortBy { case ((a, b), _) => (a.path, b.path) }
    .iterator
    .map { case ((a, b), count) => s"${a.path},${b.path},$count" }
    .mkString("\n")

  Files.write(
    Paths.get(s"references/$version.csv"),
    (header + output).getBytes(StandardCharsets.UTF_8)
  )

def buildFileReferences(using ctx: Contexts.Context) =
  val compiler =
    ctx.findPackage("dotty.tools.dotc")

  val refs =
    collection.mutable.Map[(SourceFile, SourceFile), Int]().withDefaultValue(0)

  val t = new TreeTraverser:
    override def traverse(tree: Tree): Unit =
      tree match
        case r: TermReferenceTree =>
          val target =
            try
              r.symbol match
                case ts: TermSymbol    => ts.tree.map(_.pos.sourceFile)
                case ps: PackageSymbol => None
            catch e => None
          target.foreach(t => refs(tree.pos.sourceFile, t) += 1)
          super.traverse(r)
        case _ => super.traverse(tree)

  def recur(symbol: Symbol): Unit =
    symbol match
      case ts: TermSymbol =>
        t.traverse(ts.tree)
      case ts: TypeSymbolWithBounds =>
        t.traverse(ts.tree)
      case cs: ClassSymbol =>
        cs.declarations.foreach(recur)
      case ps: PackageSymbol =>
        ps.declarations.foreach(recur)

  recur(compiler)

  refs.toMap

def getScalacClasspath(version: String): Path =
  val proc = ProcessBuilder(
    "cs",
    "fetch",
    "-q",
    s"org.scala-lang::scala3-compiler:$version"
  ).start()
  val stdout = proc.getInputStream()
  var output = ""
  Future:
    output = io.Source.fromInputStream(stdout).mkString

  assert(proc.waitFor() == 0)

  output.linesIterator
    .find(_.endsWith(s"scala3-compiler_3-$version.jar"))
    .map(Path.of(_))
    .get
